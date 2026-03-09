import React from "react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="space-y-4">
        <p>
          <strong>Email:</strong> info@finot.org
        </p>
        <p>
          <strong>Phone:</strong> +251 911 223344
        </p>
        <p>
          <strong>Location:</strong> Addis Ababa, Ethiopia
        </p>
        <p>
          <strong>Social Media:</strong> @finot on Telegram, Instagram, TikTok
        </p>
      </div>
    </div>
  );
}
