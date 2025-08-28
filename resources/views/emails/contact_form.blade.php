<!DOCTYPE html>
<html>
<head>
    <title>New Contact Form Submission - {{ config('app.name') }}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f8f9fa;
        }
        .header { 
            background-color: #007bff; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 5px 5px 0 0; 
        }
        .content { 
            background-color: white; 
            padding: 20px; 
            border-radius: 0 0 5px 5px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .contact-info { 
            background-color: #e9ecef; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
        }
        .contact-info h3 {
            margin-top: 0;
            color: #495057;
        }
        .contact-info p {
            margin: 8px 0;
        }
        .message-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin: 20px 0;
        }
        .footer { 
            text-align: center; 
            margin-top: 20px; 
            color: #6c757d; 
            font-size: 14px; 
        }
        .label {
            font-weight: bold;
            color: #495057;
        }
        .value {
            color: #212529;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>{{ config('app.name') }}</p>
        </div>
        
        <div class="content">
            <p>Hello,</p>

            <p>A new contact form submission has been received from your website.</p>

            <div class="contact-info">
                <h3>Contact Information:</h3>
                <p><span class="label">Name:</span> <span class="value">{{ $contactData['name'] }}</span></p>
                <p><span class="label">Email:</span> <span class="value">{{ $contactData['email'] }}</span></p>
                @if(isset($contactData['telephone']) && $contactData['telephone'])
                    <p><span class="label">Telephone:</span> <span class="value">{{ $contactData['telephone'] }}</span></p>
                @endif
            </div>

            <div class="message-box">
                <h3>Message:</h3>
                <p>{{ $contactData['message'] }}</p>
            </div>

            <p><strong>Submission Details:</strong></p>
            <ul>
                <li><strong>Date:</strong> {{ now()->format('F j, Y \a\t g:i A') }}</li>
                <li><strong>Time:</strong> {{ now()->format('H:i:s') }}</li>
                <li><strong>IP Address:</strong> {{ request()->ip() ?? 'Not available' }}</li>
            </ul>

            <p><strong>Next Steps:</strong></p>
            <ul>
                <li>Review the contact information above</li>
                <li>Respond to the inquiry within 24 hours</li>
                <li>Add the contact to your CRM if applicable</li>
            </ul>

            <div class="footer">
                <p>This is an automated notification from {{ config('app.name') }}</p>
                <p>Please do not reply to this email. Contact the person directly using the email provided above.</p>
            </div>
        </div>
    </div>
</body>
</html>
