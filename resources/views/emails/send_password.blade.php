<!DOCTYPE html>
<html>
<head>
    <title>Welcome to {{ config('app.name') }}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
        .credentials { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{ config('app.name') }}</h1>
        </div>
        
        <div class="content">
            <p>Dear {{ $user->name }},</p>

            <p>Your account has been created successfully as a <strong>{{ $user->role->role_name ?? 'User' }}</strong>.</p>

            <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <ul>
                    <li><strong>Email:</strong> {{ $user->email }}</li>
                    <li><strong>Temporary Password:</strong> {{ $temporaryPassword }}</li>
                </ul>
            </div>

            <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>

            <p style="text-align: center;">
                <a href="{{ route('login') }}" class="btn">Login Now</a>
            </p>

            <p>If you have any questions or need assistance, please contact our support team.</p>

            <div class="footer">
                <p>Thanks,<br>
                <strong>{{ config('app.name') }}</strong></p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
