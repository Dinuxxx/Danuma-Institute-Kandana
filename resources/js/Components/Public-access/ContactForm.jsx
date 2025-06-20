
import React, { useState } from 'react';
import axios from 'axios';


const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        telephone: '', 
        message: ''
    });
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
            
            const response = await axios.post('http://127.0.0.1:8000/messages', formData);
            setSuccess(response.data.message);
            setFormData({ name: '', email: '', telephone: '', message: '' }); 
            alert('Message submitted successfully!');

        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
                
            } else {
                setErrors({ general: 'Something went wrong. Try again later.' });
                alert('Failed to submit message. Please try again.');
            }
        }
    };

  return (
    <div className="p-6 bg-white rounded-lg max-w-lg lg:mx-auto md:w-1/2">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <input
            type="text"
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Enter Name"
            className="w-full lg:w-2/3 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="mb-6">
          <input
            type="email"
            name="email" 
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full lg:w-2/3 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="mb-6">
          <input
            type="tel"
            name="telephone" 
            value={formData.telephone}
            onChange={handleChange}
            placeholder="Telephone"
            className="w-full lg:w-2/3 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="mb-8">
          <textarea
            name="message" 
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter message"
            rows="4"
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="w-1/3 md:w-3/5 lg:w-1/3 bg-blue-500 text-white py-[11px] lg:py-[9px] px-4 font-bold text-sm md:text-md lg:text-lg rounded-3xl hover:bg-blue-600 shadow-lg"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
