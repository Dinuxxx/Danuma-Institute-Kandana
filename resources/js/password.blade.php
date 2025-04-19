@component('mail::message')
# Your Account Password

Your account has been created. Here is your temporary password:

**{{ $password }}**

Please change your password after logging in.

Thanks,<br>
{{ config('app.name') }}
@endcomponent