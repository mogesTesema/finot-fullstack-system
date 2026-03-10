from decouple import config
import requests
from django.conf import settings

class ChapaPayment:
    def __init__(self):
        # Chapa-specific Configuration
        # Defaults to the public test key if env variable not set
        self.CHAPA_SECRET = config('CHAPA_SECRET_KEY', default='CHASECK_TEST-xxxxxxxxxxxxxxxxxx')
        self.CHAPA_URL = "https://api.chapa.co/v1/transaction/initialize"
        self.CHAPA_VERIFY_URL = "https://api.chapa.co/v1/transaction/verify/"
        
        self.headers = {
            'Authorization': f'Bearer {self.CHAPA_SECRET}',
            'Content-Type': 'application/json',
        }

    def initiate_payment(self, amount, currency, email, first_name, last_name, tx_ref, callback_url=None, return_url=None):
        """
        Initiates a payment request to Chapa.
        Returns the checkout_url on success, or raises an exception.
        """
        payload = {
            'amount': str(amount),
            'currency': currency,
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'tx_ref': tx_ref,
        }
        
        # Optional URLs for redirecting user after payment
        if return_url:
            payload['return_url'] = return_url
        if callback_url:
            payload['callback_url'] = callback_url

        try:
            response = requests.post(self.CHAPA_URL, json=payload, headers=self.headers)
            response.raise_for_status() # Raise error for 4xx/5xx
            
            data = response.json()
            if data['status'] == 'success':
                return data['data']['checkout_url']
            else:
                raise ValueError(f"Chapa Error: {data['message']}")
                
        except requests.exceptions.RequestException as e:
            # Netowrk error or key error
            raise ConnectionError(f"Failed to connect to Payment Gateway: {str(e)}")

    def verify_payment(self, tx_ref):
        """
        Verifies a transaction using the tx_ref.
        """
        url = f"{self.CHAPA_VERIFY_URL}{tx_ref}"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            # Chapa returns data['status'] = 'success' in the wrapper,
            # and data['data']['status'] = 'success' for the actual transaction state
            if data.get('status') == 'success' and data.get('data', {}).get('status') == 'success':
                return True
            return False
            
        except requests.exceptions.RequestException:
            return False
