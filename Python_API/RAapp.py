from flask import Flask, request, jsonify
from flask_cors import CORS
from rpy2 import robjects
from rpy2.robjects import r
from reportlab.pdfgen import canvas
from io import BytesIO
import smtplib
from email.message import EmailMessage

app = Flask(__name__)
CORS(app)

@app.route('/api/process', methods=['POST'])
def process_data():
    try:
        data = request.get_json()
        dob = data['dob']  # Date of Birth in 'YYYY-MM-DD' format
        first_name = data['firstName']
        last_name = data['lastName']

        # R code snippet for age calculation and determining day of the week
        r_code = f"""
        dob <- as.Date("{dob}")
        age <- as.numeric(difftime(Sys.Date(), dob, units="days")) / 365
        day_of_week <- weekdays(dob)
        list(age=age, day_of_week=day_of_week)
        """

        # Evaluate R code and get the output
        r_output = robjects.r(r_code)

        # Extract age and day of the week from the R output
        age = int(r_output.rx2('age')[0])
        day_of_week = r_output.rx2('day_of_week')[0]

        # Concatenate first name and last name
        customer_name = f"{first_name} {last_name}"

        # Generate PDF
        pdf_content = generate_pdf(customer_name, age, day_of_week)

        # Send email with PDF attachment
        send_email(customer_name,data['email'], pdf_content)

        # Return a success message
        return jsonify({"message": "PDF generated and email sent successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)})

def generate_pdf(customer_name, age, day_of_week):
    # Create a BytesIO buffer to save the PDF
    pdf_buffer = BytesIO()

    # Create a PDF document using reportlab
    pdf = canvas.Canvas(pdf_buffer)
    pdf.drawString(100, 770, f"Here is the generated PDF output that you requested:")
    pdf.drawString(100, 730, f"Person's Name: {customer_name}")
    pdf.drawString(100, 710, f"Age: {age}")
    pdf.drawString(100, 690, f"Day of the Week of Birth: {day_of_week}")
    # You can add more information to the PDF as needed

    # Save the PDF to the BytesIO buffer
    pdf.showPage()
    pdf.save()

    # Return the content of the BytesIO buffer
    return pdf_buffer.getvalue()

def send_email(customer_name,receiver_email, pdf_content):
    # Configure your email server settings
    msg = EmailMessage()
    msg.set_content(f"Hi {customer_name},\nThank you for submitting the form!\nPlease find the attached PDF.\n\nRegards,\nVatsal Sheth")
    msg['Subject'] = 'PDF Report'
    msg['From'] = 'your_email@example.com'
    msg['To'] = receiver_email

    msg.add_attachment(pdf_content, maintype='application', subtype='octet-stream', filename='report.pdf')

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('blockcenteremailservice@gmail.com', 'hcsp apcw cdvh yxdc')
        server.send_message(msg)

if __name__ == '__main__':
    app.run(debug=True)
