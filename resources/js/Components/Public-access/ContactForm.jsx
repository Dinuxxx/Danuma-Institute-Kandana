import React, { useState } from 'react';
import axios from 'axios';

const ContactUs = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/favicon.ico', formData);
            setSuccess(response.data.message);
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'Something went wrong. Try again later.' });
            }
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: 'auto' }}>
            <h2>Contact Us</h2>
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && <p style={{ color: 'red' }}>{errors.name[0]}</p>}
                </div>
                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <p style={{ color: 'red' }}>{errors.email[0]}</p>}
                </div>
                <div>
                    <textarea
                        name="message"
                        placeholder="Your Message"
                        value={formData.message}
                        onChange={handleChange}
                    />
                    {errors.message && <p style={{ color: 'red' }}>{errors.message[0]}</p>}
                </div>
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ContactUs;
