<!DOCTYPE html>
<html>
<head>
    <title>Your Temporary Password</title>
</head>
<body>
    <p>Dear {{ $user->first_name }},</p>
    <p>Your account has been created. Here is your temporary password:</p>
    <h2>{{ $temporaryPassword }}</h2>
    <p>Please log in and change your password as soon as possible.</p>
    <p>Thank you!</p>
</body>
</html>
