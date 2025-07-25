import streamlit as st
import pandas as pd
import sqlite3
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os
from passlib.context import CryptContext # For password hashing

# --- Security Setup: Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Database Setup ---
DB_NAME = 'student_data.db' # SQLite database file name
MODEL_PATH = 'student_performance_model.pkl' # Path to save the trained ML model

def init_db():
    """Initializes the SQLite database with students and users tables."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Create students table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            student_id TEXT PRIMARY KEY,
            name TEXT,
            attendance REAL,
            mid_term_marks REAL,
            final_term_marks REAL,
            previous_gpa REAL,
            -- 'outcome' is derived: 1 for Pass, 0 for Fail (e.g., final_term_marks >= 60)
            outcome INTEGER
        )
    ''')

    # Create users table for login system
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT,
            role TEXT
        )
    ''')

    # Add some default users if they don't already exist
    users_to_add = [
        ('admin', get_password_hash('adminpass'), 'admin'),
        ('teacher', get_password_hash('teacherpass'), 'teacher'),
        ('student1', get_password_hash('studentpass'), 'student')
    ]
    for user_data in users_to_add:
        try:
            cursor.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", user_data)
        except sqlite3.IntegrityError:
            pass # User already exists, skip insertion

    conn.commit()
    conn.close()

def add_student_data(df):
    """Adds or updates student data from a DataFrame to the database using INSERT OR REPLACE."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cols = ', '.join([f'"{col}"' for col in df.columns])
    placeholders = ', '.join(['?'] * len(df.columns))

    # Using INSERT OR REPLACE to handle duplicates based on the PRIMARY KEY (student_id)
    sql = f"INSERT OR REPLACE INTO students ({cols}) VALUES ({placeholders})"
    cursor.executemany(sql, df.to_records(index=False))
    conn.commit()
    conn.close()

def get_all_student_data():
    """Retrieves all student data from the database."""
    conn = sqlite3.connect(DB_NAME)
    df = pd.read_sql_query("SELECT * FROM students", conn)
    conn.close()
    return df

def get_user(username, password):
    """Authenticates a user based on username and password."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row # Allows accessing columns by name
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    user_record = cursor.fetchone()
    conn.close()

    # Verify password against the stored hash
    if user_record and verify_password(password, user_record['password']):
        return {'username': user_record['username'], 'role': user_record['role']}
    return None

# --- Password Hashing Functions ---
def verify_password(plain_password, hashed_password):
    """Verifies a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hashes a password."""
    return pwd_context.hash(password)

# --- Machine Learning Model ---
FEATURES = ['attendance', 'mid_term_marks', 'previous_gpa'] # CRITICAL FIX: Removed 'final_term_marks' to prevent data leakage.
TARGET = 'outcome' # Target variable for prediction (Pass/Fail)

def train_model(df):
    """
    Trains a Logistic Regression model for student performance prediction.
    It expects 'outcome' (1 for Pass, 0 for Fail) to be present in the DataFrame.
    """
    # Ensure all feature columns are numeric, coercing errors to NaN
    for col in FEATURES:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # Drop rows where any of the features or the target are missing
    df.dropna(subset=FEATURES + [TARGET], inplace=True)

    if df.empty:
        st.error("Not enough data to train the model after cleaning. Please upload more data with complete records.")
        return None, None, None, None

    X = df[FEATURES]
    y = df[TARGET]

    # Check if there are at least two unique classes in the target variable
    if len(np.unique(y)) < 2:
        st.warning("Only one class present in the target variable (all Pass or all Fail). Cannot train a classification model.")
        return None, None, None, None

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Initialize and train the Logistic Regression model
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    conf_matrix = confusion_matrix(y_test, y_pred)
    class_report = classification_report(y_test, y_pred)

    # Save the trained model to a file
    joblib.dump(model, MODEL_PATH)
    return model, accuracy, conf_matrix, class_report

def load_model():
    """Loads a pre-trained model from the specified path."""
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            return model
        except Exception as e:
            st.error(f"Error loading model: {e}")
            return None
    return None

def predict_performance(model, data):
    """
    Predicts student performance (Pass/Fail) and probability using the trained model.
    Data should be a dictionary containing feature values.
    """
    if model is None:
        return None, None

    # Convert input data to a DataFrame, ensuring correct feature order and type
    input_df = pd.DataFrame([data])
    for col in FEATURES:
        if col not in input_df.columns:
            st.error(f"Missing feature: {col} in input data for prediction.")
            return None, None
        input_df[col] = pd.to_numeric(input_df[col], errors='coerce')

    # Predict the class (0 or 1)
    prediction = model.predict(input_df[FEATURES])[0]
    # Predict the probability of 'Pass' (class 1)
    probability = model.predict_proba(input_df[FEATURES])[0][1]
    return prediction, probability

def get_risk_category(probability):
    """Categorizes student risk based on their predicted probability of passing."""
    if probability >= 0.8:
        return "Low Risk"
    elif probability >= 0.5:
        return "Medium Risk"
    else:
        return "High Risk"

def get_recommendations(student_data, risk_category):
    """Generates actionable recommendations based on student data and risk level."""
    recommendations = []
    # Make sure relevant keys exist in student_data dictionary
    attendance = student_data.get('attendance', 0)
    mid_term_marks = student_data.get('mid_term_marks', 0)
    previous_gpa = student_data.get('previous_gpa', 0)

    if risk_category == "High Risk":
        recommendations.append("Immediate intervention is recommended.")
        if attendance < 70:
            recommendations.append("Focus on improving attendance to ensure better learning opportunities.")
        if mid_term_marks < 50:
            recommendations.append("Intensify preparation for final exams; consider tutoring or study groups.")
        if previous_gpa < 2.5:
            recommendations.append("Strengthen foundational concepts from previous academic terms.")
    elif risk_category == "Medium Risk":
        recommendations.append("Monitor student progress closely and offer support as needed.")
        if attendance < 80:
            recommendations.append("Encourage consistent attendance to keep up with coursework.")
        if mid_term_marks < 65:
            recommendations.append("Dedicate more time to understanding challenging topics before final exams.")
    else: # Low Risk
        recommendations.append("Student is performing well. Encourage continued excellence.")
        recommendations.append("Suggest participation in advanced topics or extracurricular activities to further enrich their learning.")

    return recommendations

# --- Streamlit UI Functions ---
st.set_page_config(page_title="Student Academic Performance Predictor", layout="wide", initial_sidebar_state="expanded")

def main():
    """Main function to run the Streamlit application."""
    init_db() # Initialize the database

    # Initialize session state variables for login if they don't exist
    if 'logged_in' not in st.session_state:
        st.session_state.logged_in = False
        st.session_state.username = None
        st.session_state.role = None

    # Show login page if not logged in, otherwise show the dashboard
    if not st.session_state.logged_in:
        show_login_page()
    else:
        show_dashboard()

def show_login_page():
    """Displays the login form for users."""
    st.markdown("<h1 style='text-align: center;'>Login to Student Performance Dashboard</h1>", unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 1, 1]) # Use columns for centering the form
    with col2: # Place form in the middle column
        with st.form("login_form", clear_on_submit=False):
            st.markdown("### Please Enter Your Credentials")
            username = st.text_input("Username", key="login_username")
            password = st.text_input("Password", type="password", key="login_password")
            submitted = st.form_submit_button("Login")

            if submitted:
                user = get_user(username, password)
                if user:
                    st.session_state.logged_in = True
                    st.session_state.username = user['username']
                    st.session_state.role = user['role']
                    st.success(f"Logged in as {st.session_state.role.capitalize()}")
                    st.rerun() # Rerun to switch to dashboard
                else:
                    st.error("Invalid username or password. Please try again.")

    st.markdown("""
        <div style='text-align: center; margin-top: 20px;'>
            <p><strong>Demo Credentials:</strong></p>
            <ul>
                <li>Admin: Username: <code>admin</code>, Password: <code>adminpass</code></li>
                <li>Teacher: Username: <code>teacher</code>, Password: <code>teacherpass</code></li>
                <li>Student: Username: <code>student1</code>, Password: <code>studentpass</code></li>
            </ul>
        </div>
    """, unsafe_allow_html=True)


def show_dashboard():
    """Displays the main dashboard based on user role."""
    st.sidebar.title(f"Welcome, {st.session_state.username}!")
    st.sidebar.markdown(f"**Role:** {st.session_state.role.capitalize()}")
    st.sidebar.button("Logout", on_click=logout, help="Click to log out of the application.")

    st.markdown("<h1 style='text-align: center;'>Student Academic Performance Prediction Dashboard</h1>", unsafe_allow_html=True)

    # Route to different dashboards based on user role
    if st.session_state.role == 'admin':
        admin_dashboard()
    elif st.session_state.role == 'teacher':
        teacher_dashboard()
    elif st.session_state.role == 'student':
        student_dashboard()

def logout():
    """Logs out the current user and resets session state."""
    st.session_state.logged_in = False
    st.session_state.username = None
    st.session_state.role = None
    st.rerun() # Rerun to go back to the login page

def admin_dashboard():
    """Content for the Admin dashboard."""
    st.header("Admin Privileges")

    st.subheader("📊 Upload New Student Data")
    st.write("Upload a CSV file containing student information. Ensure it has columns like `student_id`, `name`, `attendance`, `mid_term_marks`, `final_term_marks`, `previous_gpa`.")
    uploaded_file = st.file_uploader("Choose a CSV file", type=["csv"], help="The CSV should contain student academic records.")
    if uploaded_file is not None:
        try:
            df = pd.read_csv(uploaded_file)
            required_columns = ['student_id', 'name', 'attendance', 'mid_term_marks', 'final_term_marks', 'previous_gpa']

            if not all(col in df.columns for col in required_columns):
                st.error(f"Error: The uploaded CSV must contain all required columns: {', '.join(required_columns)}. Please check your file.")
            else:
                # For demo, define 'outcome': 1 if final_term_marks >= 60, else 0
                df[TARGET] = (df['final_term_marks'] >= 60).astype(int)
                add_student_data(df)
                st.success("Data uploaded and saved successfully!")
                st.dataframe(df.head()) # Display first few rows of the uploaded data
        except Exception as e:
            st.error(f"An error occurred while processing the CSV file: {e}")

    st.subheader("⚙️ Train/Retrain Machine Learning Model")
    st.write("Train or retrain the prediction model using the current student data in the database.")
    if st.button("Train Model Now", help="This will train a new model and save it. Existing model will be overwritten."):
        df_students = get_all_student_data()
        if df_students.empty:
            st.warning("No student data available in the database to train the model. Please upload data first.")
        else:
            with st.spinner("Training model... This may take a moment."):
                model, accuracy, conf_matrix, class_report = train_model(df_students)
                if model:
                    st.success("Model trained successfully!")
                    st.metric(label="Model Accuracy", value=f"{accuracy:.2%}")

                    st.markdown("#### Confusion Matrix")
                    st.dataframe(pd.DataFrame(conf_matrix, index=['Actual Fail', 'Actual Pass'], columns=['Predicted Fail', 'Predicted Pass']))
                    st.markdown("#### Classification Report")
                    st.code(class_report)
                else:
                    st.error("Failed to train model. Check logs or previous warnings.")

    st.markdown("---")
    st.subheader("📊 Overall Class Performance Analytics")
    display_analytics()

    st.markdown("---")
    st.subheader("🔮 Predict Individual Student Performance")
    predict_individual_performance()


def teacher_dashboard():
    """Content for the Teacher dashboard."""
    st.header("Teacher Dashboard")

    st.subheader("📊 Overall Class Performance Analytics")
    display_analytics()

    st.markdown("---")
    st.subheader("🔮 Predict Individual Student Performance")
    predict_individual_performance()

def student_dashboard():
    """Content for the Student dashboard, allowing them to view their own performance."""
    st.header("My Performance Dashboard")
    st.write("Enter your Student ID to view your predicted performance and recommendations.")

    student_id_input = st.text_input("Enter Your Student ID:", help="This is the unique ID from the uploaded data.")
    if student_id_input:
        df_students = get_all_student_data()
        student_data_row = df_students[df_students['student_id'] == student_id_input]

        if not student_data_row.empty:
            # Convert the single row DataFrame to a dictionary
            student_data = student_data_row.iloc[0].to_dict()

            st.subheader(f"Performance Details for {student_data.get('name', 'Unknown Student')}")
            col_info1, col_info2 = st.columns(2)
            with col_info1:
                st.info(f"**Attendance:** {student_data.get('attendance', 'N/A'):.2f}%")
                st.info(f"**Mid-Term Marks:** {student_data.get('mid_term_marks', 'N/A'):.2f}")
            with col_info2:
                st.info(f"**Final-Term Marks:** {student_data.get('final_term_marks', 'N/A'):.2f}")
                st.info(f"**Previous GPA:** {student_data.get('previous_gpa', 'N/A'):.2f}")


            model = load_model()
            if model:
                # Prepare data for prediction (excluding the 'outcome' as it's what we predict)
                data_for_pred = {key: student_data[key] for key in FEATURES if key in student_data}
                prediction, probability = predict_performance(model, data_for_pred)

                if prediction is not None:
                    status = "Pass" if prediction == 1 else "Fail"
                    st.success(f"**Predicted Outcome:** {status}")
                    st.write(f"*(Probability of Passing: {probability:.2%})*")

                    risk_category = get_risk_category(probability)
                    st.warning(f"**Risk Level:** {risk_category}")

                    st.markdown("### Actionable Recommendations:")
                    recommendations = get_recommendations(student_data, risk_category)
                    for rec in recommendations:
                        st.markdown(f"- {rec}")
                else:
                    st.error("Could not predict performance. Please ensure all required academic data is entered and the model is trained by an administrator.")
            else:
                st.warning("The prediction model has not been trained yet. Please ask an administrator to train the model.")
        else:
            st.info("Student ID not found in the database. Please check the ID or contact your administrator.")
    else:
        st.info("Enter your student ID above to see your performance details.")


def display_analytics():
    """Displays various visual analytics charts for class-wide performance."""
    df_students = get_all_student_data()

    if df_students.empty:
        st.info("No student data available for analytics. Please upload data via the Admin dashboard.")
        return

    st.markdown("---") # Separator

    # Performance Distribution (Pass/Fail)
    st.subheader("Performance Distribution (Pass/Fail)")
    outcome_counts = df_students[TARGET].map({1: 'Pass', 0: 'Fail'}).value_counts()
    fig1, ax1 = plt.subplots(figsize=(6, 6))
    ax1.pie(outcome_counts, labels=outcome_counts.index, autopct='%1.1f%%', startangle=90,
            colors=['#66b3ff','#ff9999'], pctdistance=0.85, wedgeprops=dict(width=0.3))
    ax1.set_title('Overall Pass/Fail Ratio')
    # Draw a circle in the center to make it a donut chart
    centre_circle = plt.Circle((0,0),0.70,fc='white')
    fig1.gca().add_artist(centre_circle)
    ax1.axis('equal') # Equal aspect ratio ensures that pie is drawn as a circle.
    st.pyplot(fig1)

    # Marks Distribution
    st.subheader("Marks Distribution")
    fig2, (ax_mid, ax_final) = plt.subplots(1, 2, figsize=(15, 6))
    sns.histplot(df_students['mid_term_marks'], kde=True, ax=ax_mid, color='skyblue', bins=10)
    ax_mid.set_title('Mid-Term Marks Distribution')
    ax_mid.set_xlabel('Marks')
    ax_mid.set_ylabel('Number of Students')

    sns.histplot(df_students['final_term_marks'], kde=True, ax=ax_final, color='lightcoral', bins=10)
    ax_final.set_title('Final-Term Marks Distribution')
    ax_final.set_xlabel('Marks')
    ax_final.set_ylabel('Number of Students')
    st.pyplot(fig2)

    # Attendance vs. Final Marks Scatter Plot
    st.subheader("Attendance vs. Final Marks")
    fig3, ax3 = plt.subplots(figsize=(10, 7))
    sns.scatterplot(x='attendance', y='final_term_marks', hue=TARGET, data=df_students, ax=ax3,
                    palette={1: 'green', 0: 'red'}, s=100, alpha=0.7)
    ax3.set_title('Attendance vs. Final Marks by Outcome')
    ax3.set_xlabel('Attendance (%)')
    ax3.set_ylabel('Final Term Marks')
    ax3.legend(title='Outcome', labels=['Fail', 'Pass'])
    st.pyplot(fig3)

    # Previous GPA Distribution
    st.subheader("Previous GPA Distribution")
    fig4, ax4 = plt.subplots(figsize=(8, 6))
    sns.histplot(df_students['previous_gpa'], kde=True, ax=ax4, color='lightgreen', bins=10)
    ax4.set_title('Previous GPA Distribution')
    ax4.set_xlabel('GPA')
    ax4.set_ylabel('Number of Students')
    st.pyplot(fig4)


def predict_individual_performance():
    """Form for predicting individual student performance and displaying results."""
    model = load_model()
    if model is None:
        st.warning("The machine learning model has not been trained yet. Please ask an administrator to train the model first.")
        return

    with st.form("predict_form"):
        st.write("Enter the following details to predict a student's performance:")
        student_name_display = st.text_input("Student Name (for display purposes only)", help="This name won't be saved, just used for displaying results.")
        attendance = st.number_input("Attendance (%)", min_value=0.0, max_value=100.0, value=85.0, help="Student's attendance percentage.")
        mid_term_marks = st.number_input("Mid-Term Marks (0-100)", min_value=0.0, max_value=100.0, value=70.0, help="Student's marks in mid-term assessments.")
        previous_gpa = st.number_input("Previous GPA (0.0-4.0)", min_value=0.0, max_value=4.0, value=3.0, help="Student's GPA from previous academic period.")

        submitted = st.form_submit_button("Predict Performance")

        if submitted:
            # Prepare input data for the model
            input_data = {
                'attendance': attendance,
                'mid_term_marks': mid_term_marks,
                'previous_gpa': previous_gpa
            }
            prediction, probability = predict_performance(model, input_data)

            if prediction is not None:
                status = "Pass" if prediction == 1 else "Fail"
                st.subheader(f"Prediction for {student_name_display or 'this student'}:")
                if status == "Pass":
                    st.success(f"**Predicted Outcome:** {status} 🎉")
                else:
                    st.error(f"**Predicted Outcome:** {status} 📉")

                st.write(f"*(Probability of Passing: {probability:.2%})*")

                risk_category = get_risk_category(probability)
                st.info(f"**Risk Level:** {risk_category}")

                st.markdown("### Actionable Recommendations:")
                # Pass the raw input_data to get_recommendations
                recommendations = get_recommendations(input_data, risk_category)
                for rec in recommendations:
                    st.markdown(f"- {rec}")
            else:
                st.error("Prediction failed. Please ensure the model is trained and input values are valid.")

if __name__ == "__main__":
    main()
