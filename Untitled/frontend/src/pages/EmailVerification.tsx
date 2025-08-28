import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/verify-email?token=${verificationToken}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to verify email. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/users/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Verification email sent successfully!');
      } else {
        alert(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      alert('Failed to send verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {message}
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-gray-600">
                  Redirecting to login page in 3 seconds...
                </p>
                <Button asChild className="w-full">
                  <Link to="/login">Go to Login</Link>
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="text-center">
                  <XCircle className="h-12 w-12 text-red-600 mx-auto" />
                </div>
                
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {message}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email to resend verification"
                    />
                  </div>
                  
                  <Button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="w-full"
                    variant="outline"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button asChild variant="ghost">
                    <Link to="/login">Back to Login</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
