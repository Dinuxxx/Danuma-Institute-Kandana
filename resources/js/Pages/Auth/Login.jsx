import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login">
            <ApplicationLogo/>
            </Head>

            <form onSubmit={submit} className=' p-6 sm:p-10 md:p-16 lg:p-20 lg:pt-10'>

                <ApplicationLogo className="h-20 w-auto mx-auto mb-12" />

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                {/* Email Input */}
                <div>
                    <InputLabel htmlFor="email" value="Username" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email || ''} 
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password Input */}
                <div className="mt-6">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password || ''} 
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Remember Me Checkbox */}
                <div className="mt-2 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                </div>

                {/* Submit Button and Forgot Password */}
                <div className="mt-10 flex flex-col items-center">
                    <PrimaryButton className="w-full sm:w-48 font-bold text-center flex justify-center sm:rounded-xl text-lg pt-1 pb-1 shadow-md" disabled={processing}
                        style={{ backgroundColor: '#FC9C02', borderColor: '#FC9C02'}}
                    >
                        {processing ? 'Logging in...' : 'Login'} 
                    </PrimaryButton>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="mt-2 text-sm text-blue-500 hover:text-blue-700 underline"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>
            </form>
        </GuestLayout>  
    );
}