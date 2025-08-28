import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Home Services, Simplified</h1>
            <p className="text-xl mb-8">Connect with trusted service professionals in your area</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                className="bg-white text-service-blue hover:bg-gray-100"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="border-white text-service-blue hover:bg-gray-100"
                onClick={() => navigate('/services')}
              >
                Find Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Features Content */}
            <div>
              <h2 className="text-3xl font-bold mb-12">How It Works</h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-service-lightBlue rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-service-blue">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Search for Services</h3>
                    <p className="text-gray-600">Browse through a wide range of professional service providers in your area</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-service-lightBlue rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-service-blue">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Book an Appointment</h3>
                    <p className="text-gray-600">Select a date and time that works for you and describe your needs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-service-lightBlue rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-service-blue">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Get it Done</h3>
                    <p className="text-gray-600">Your service provider will come to your home and complete the job</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features Image */}
            <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1482731215275-a1f151646268?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Professional service provider at work"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Services Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { 
                  name: 'Plumbing',
                  image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop&q=60'
                },
                {
                  name: 'Electrical',
                  image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&auto=format&fit=crop&q=60'
                },
                {
                  name: 'Cleaning',
                  image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=60'
                },
                {
                  name: 'Gardening',
                  image: 'https://plus.unsplash.com/premium_photo-1680286739871-01142bc609df?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                },
                {
                  name: 'Painting',
                  image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop&q=60'
                },
                {
                  name: 'Carpentry',
                  image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=60'
                }
              ].map((service) => (
                <div key={service.name} className="bg-white p-4 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow">
                  <div className="h-32 w-full mb-3 rounded-lg overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium">{service.name}</h3>
                </div>
              ))}
            </div>

            {/* Services Image */}
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl order-first lg:order-last">
              <img 
                src="https://images.unsplash.com/photo-1587582423116-ec07293f0395?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Professional cleaning service"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-lg font-semibold">Find the Perfect Service</p>
                <p className="text-sm opacity-90">Browse through our wide range of professional services</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <Button onClick={() => navigate('/services')}>View All Services</Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-service-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join our platform today to connect with quality service providers or offer your services to those in need.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-white text-service-blue hover:bg-gray-100"
              onClick={() => navigate('/register')}
            >
              Create an Account
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              className="bg-white text-service-blue hover:bg-gray-100"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
