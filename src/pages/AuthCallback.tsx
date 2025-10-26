import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'completing' | 'error'>('loading');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error during auth callback:', sessionError);
          setStatus('error');
          toast.error('Failed to confirm your email. Please try again.');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        const user = sessionData?.session?.user;
        if (!user) {
          setStatus('error');
          toast.error('No user session found.');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        const pendingData = localStorage.getItem('pendingRegistrationData');

        if (pendingData) {
          setStatus('completing');

          try {
            const registrationData = JSON.parse(pendingData);

            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                age: registrationData.age,
                date_of_birth: registrationData.date_of_birth,
                gender: registrationData.gender,
                country: registrationData.country,
                height_cm: registrationData.height_cm,
                weight_kg: registrationData.weight_kg,
                occupation_activity: registrationData.occupation_activity,
                unit_system: registrationData.unit_system,
                onboarding_completed: true,
              })
              .eq('id', user.id);

            if (updateError) {
              console.error('Error updating profile:', updateError);
              throw updateError;
            }

            localStorage.removeItem('pendingRegistrationData');

            toast.success('Email confirmed! Your profile is now complete.');
            navigate('/quiz');
          } catch (error) {
            console.error('Error completing registration:', error);
            toast.error('Profile update failed. Please complete your profile in settings.');
            navigate('/profile');
          }
        } else {
          const userMetadata = user.user_metadata?.registration_data;

          if (userMetadata) {
            setStatus('completing');

            try {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  age: userMetadata.age,
                  date_of_birth: userMetadata.date_of_birth,
                  gender: userMetadata.gender,
                  country: userMetadata.country,
                  height_cm: userMetadata.height_cm,
                  weight_kg: userMetadata.weight_kg,
                  occupation_activity: userMetadata.occupation_activity,
                  unit_system: userMetadata.unit_system,
                  onboarding_completed: true,
                })
                .eq('id', user.id);

              if (updateError) {
                console.error('Error updating profile:', updateError);
                throw updateError;
              }

              toast.success('Email confirmed! Your profile is now complete.');
              navigate('/quiz');
            } catch (error) {
              console.error('Error completing registration:', error);
              toast.error('Profile update failed. Please complete your profile in settings.');
              navigate('/profile');
            }
          } else {
            toast.success('Email confirmed successfully!');
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setStatus('error');
        toast.error('An unexpected error occurred.');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-lg font-medium text-foreground">
          {status === 'loading' && 'Confirming your email...'}
          {status === 'completing' && 'Completing your profile...'}
          {status === 'error' && 'Redirecting...'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Please wait a moment
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;