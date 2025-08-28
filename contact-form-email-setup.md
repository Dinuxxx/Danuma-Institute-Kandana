# Contact Form Email Setup

## Overview
This setup enables email notifications for contact form submissions. When someone submits a contact form on your website, you'll receive an email notification with all the form details.

## Configuration

### Step 1: Update your .env file

Add these settings to your `.env` file:

```env
# Mail Configuration (Mailtrap)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@danuma-institute.com"
MAIL_FROM_NAME="Danuma Institute Kandana"

# Admin Email for Contact Form Notifications
ADMIN_EMAIL=your-admin-email@example.com
```

### Step 2: Get your Mailtrap credentials

1. Go to [mailtrap.io](https://mailtrap.io)
2. Sign up or log in to your account
3. Create a new inbox or use an existing one
4. Go to the inbox settings → SMTP Settings
5. Copy the username and password

### Step 3: Test the contact form email

```bash
# Clear configuration cache
php artisan config:clear

# Test contact form email
php artisan email:test-contact-form your-email@example.com
```

## How it Works

### 1. Contact Form Submission
When someone submits the contact form:
- Form data is validated
- Message is saved to the database
- Email notification is sent to the admin email

### 2. Email Content
The email includes:
- **Contact Information**: Name, Email, Telephone
- **Message**: The actual message from the contact form
- **Submission Details**: Date, Time, IP Address
- **Next Steps**: Suggested actions for the admin

### 3. Email Template
The email uses a professional HTML template located at:
`resources/views/emails/contact_form.blade.php`

## Files Created/Modified

### New Files:
- `app/Mail/ContactFormNotification.php` - Email notification class
- `resources/views/emails/contact_form.blade.php` - Email template
- `app/Console/Commands/TestContactFormEmail.php` - Testing command

### Modified Files:
- `app/Http/Controllers/MessageController.php` - Added email sending
- `config/app.php` - Added admin email configuration

## Testing

### Test with Real Form Submission:
1. Go to your website's contact page
2. Fill out and submit the contact form
3. Check your Mailtrap inbox for the notification

### Test with Command:
```bash
php artisan email:test-contact-form admin@example.com
```

## Customization

### Change Admin Email:
Update the `ADMIN_EMAIL` in your `.env` file:
```env
ADMIN_EMAIL=your-preferred-email@example.com
```

### Modify Email Template:
Edit `resources/views/emails/contact_form.blade.php` to customize:
- Email styling
- Content layout
- Information displayed

### Add Multiple Recipients:
Modify `MessageController.php` to send to multiple emails:
```php
Mail::to(['admin@example.com', 'manager@example.com'])
    ->send(new ContactFormNotification($validated));
```

## Troubleshooting

### Email Not Sending:
1. Check Mailtrap credentials in `.env`
2. Run `php artisan config:clear`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Test with: `php artisan email:test-contact-form`

### Common Issues:
- **Wrong Mailtrap credentials**: Verify username/password
- **Configuration cache**: Run `php artisan config:clear`
- **Wrong host**: Use `smtp.mailtrap.io` (not `sandbox.smtp.mailtrap.io`)
- **Wrong port**: Use `2525` for TLS

### Debug Commands:
```bash
# Check email configuration
php artisan email:check

# Test basic email
php artisan email:test

# Test contact form email
php artisan email:test-contact-form

# View logs
tail -f storage/logs/laravel.log
```

## Security Notes

- Contact form data is validated before processing
- Email sending failures don't break form submission
- All email attempts are logged for debugging
- IP addresses are captured for security monitoring
