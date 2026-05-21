import React, { useState } from 'react';
import { Mail, Instagram, Send } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Opens default mail client with pre-filled body
    const subject = encodeURIComponent(`Message from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:celureskincareai@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 px-6">
      <div className="max-w-lg mx-auto pt-12">
        <h1 className="text-3xl font-bold mb-2 text-white">Contact Us</h1>
        <p className="text-gray-400 text-sm mb-8">We'd love to hear from you — questions, feedback, or partnerships.</p>

        {/* Direct email */}
        <a href="mailto:celureskincareai@gmail.com"
          className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 mb-4 hover:border-pink-500/40 transition-colors">
          <Mail className="w-5 h-5 text-pink-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Email us directly</p>
            <p className="text-white text-sm font-medium">celureskincareai@gmail.com</p>
          </div>
        </a>

        {/* Instagram */}
        <a href="https://instagram.com/celure.ai" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 mb-8 hover:border-pink-500/40 transition-colors">
          <Instagram className="w-5 h-5 text-pink-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Follow us on Instagram</p>
            <p className="text-white text-sm font-medium">@celure.ai</p>
          </div>
        </a>

        {/* Contact form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-white font-semibold mb-4">Send a Message</p>
          {sent ? (
            <div className="flex items-center gap-2 text-green-400 text-sm py-4">
              <Send className="w-4 h-4" />
              Opening your mail app… thanks for reaching out!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500" />
              <input required type="email" placeholder="Your email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500" />
              <textarea required rows={4} placeholder="Your message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none" />
              <button type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}