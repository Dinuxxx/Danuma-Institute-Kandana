<!DOCTYPE html>
<html>
<head>
    <title>Welcome to {{ config('app.name') }}</title>
</head>
<body>
    <p>Dear {{ $user->name }},</p>

    <p>Your account has been created successfully as a {{ $user->userRegistration->role->role_name }}.</p>

    <p>Here are your login credentials:</p>
    <ul>
        <li>Email: {{ $user->email }}</li>
        <li>Temporary Password: {{ $temporaryPassword }}</li>
    </ul>

    <p>Please change your password after your first login.</p>

    <p>
        <a href="{{ route('login') }}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">
            Login Now
        </a>
    </p>

    <p>For security reasons, please verify your email address by clicking the verification link sent in a separate email.</p>

    <p>Thanks,<br>
    {{ config('app.name') }}</p>
</body>
</html>
