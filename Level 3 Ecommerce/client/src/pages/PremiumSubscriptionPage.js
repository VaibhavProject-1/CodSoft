import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';


const PremiumSubscriptionPage = () => {
  const [orderId, setOrderId] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);

  // Define durationToAmount within the scope of PremiumSubscriptionPage component
  const durationToAmount = {
    1: 500,
    3: 1000,
    6: 1500,
  };

  const handleSubscribe = async (duration) => {
    try {
      // Make a request to your backend to create an order
      const response = await fetch(`${process.env.REACT_APP_BACK_URL}/api/premium/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: durationToAmount[duration],
          currency: 'INR',
          duration: duration,
          username: localStorage.getItem('username'), // Assuming username is stored in localStorage
          email: localStorage.getItem('email'), // Assuming email is stored in localStorage
        }),
      });
  
      const data = await response.json();
  
      // Set the obtained order ID
      setOrderId(data.orderId);
  
      // Initialize and open Razorpay payment modal
      const options = {
        key: "rzp_test_X7XIYABuIGXSFd",
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'TuneSync',
        description: `Premium Subscription - ${duration} month(s)`,
        handler: async function (response) {
          // Handle success callback
          Swal.fire({
            icon: 'success',
            title: 'Payment Success',
            text: 'Your payment was successful.'+ response,
          });
  
          // Save payment data and update user's premium status
          const savePaymentResponse = await fetch(`${process.env.REACT_APP_BACK_URL}/api/premium/save-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              duration: duration,
              username: localStorage.getItem('username'),
              email:localStorage.getItem('email'),
            }),
          });
  
          const savePaymentData = await savePaymentResponse.json();
          // console.log('Save Payment Response:', savePaymentData);
  
          // Update user's premium status
          const updateUserResponse = await fetch(`${process.env.REACT_APP_BACK_URL}/api/premium/update-user-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: localStorage.getItem('username'),
              duration: duration,
            }),
          });
  
          const updateUserData = await updateUserResponse.json();
          // console.log('Update User Response:', updateUserData);
          if (updateUserData.status === 'success') {
            localStorage.setItem('isPremiumUser', 'true');
        }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
        },
      };
  
      const razorpayObject = new window.Razorpay(options);
      razorpayObject.open();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Subscription Error',
        text: 'There was an error during subscription. Please try again later.',
      });
      // Handle error
    }
  };
  



  useEffect(() => {
    const razorpayScript = document.createElement('script');
    razorpayScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
    razorpayScript.async = true;
    razorpayScript.onload = () => {
        // console.log('Razorpay script has loaded successfully.');
        // Razorpay script has loaded, now you can use it
    };
    document.body.appendChild(razorpayScript);

    return () => {
        // Cleanup if needed
        document.body.removeChild(razorpayScript);
    };
}, []);

  

  return (
    <div>
      <h2>Subscribe to Premium</h2>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <SubscriptionCard
          duration="1 Month"
          amount={durationToAmount[1]}
          onSelectDuration={() => setSelectedDuration(1)}
          onSubscribe={() => handleSubscribe(1)}
        />
        <SubscriptionCard
          duration="3 Months"
          amount={durationToAmount[3]}
          onSelectDuration={() => setSelectedDuration(3)}
          onSubscribe={() => handleSubscribe(3)}
        />
        <SubscriptionCard
          duration="6 Months"
          amount={durationToAmount[6]}
          onSelectDuration={() => setSelectedDuration(6)}
          onSubscribe={() => handleSubscribe(6)}
        />
      </div>
    </div>
  );
};

const SubscriptionCard = ({ duration, amount, onSelectDuration, onSubscribe }) => {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        width: '200px',
        textAlign: 'center',
        cursor: 'pointer',
      }}
      onClick={onSelectDuration}
    >
      <h3 style={{ color: '#1E40AF' }}>{duration}</h3>
      <p style={{ fontSize: '24px', color: '#1E40AF' }}>Price: {amount} INR</p>
      <p style={{ color: '#6B7280' }}>Additional Information...</p>
      <button
        style={{
          marginTop: '10px',
          backgroundColor: '#1E40AF',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSubscribe();
        }}
      >
        Subscribe Now
      </button>
    </div>
  );
};

export default PremiumSubscriptionPage;