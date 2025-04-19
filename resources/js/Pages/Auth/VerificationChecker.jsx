import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/inertia-react';
import { Inertia } from '@inertiajs/inertia';

export default function VerificationChecker() {
    const { auth } = usePage().props;
    
    useEffect(() => {
        // Only run this if the user is logged in but not verified
        if (auth.user && !auth.user.email_verified_at) {
            const checkVerificationStatus = () => {
                // Fetch the current user's verification status
                axios.get('/verification-status')
                    .then(response => {
                        if (response.data.verified) {
                            // Redirect to dashboard if verified
                            Inertia.visit(route('dashboard'));
                        }
                    })
                    .catch(error => {
                        console.error('Error checking verification status:', error);
                    });
            };

            // Check every 5 seconds
            const interval = setInterval(checkVerificationStatus, 5000);
            
            // Clean up interval when component unmounts
            return () => clearInterval(interval);
        }
    }, [auth.user]);

    // This component doesn't render anything
    return null;
}