
import React, { useState } from 'react';
import { Card, CardContent, Input, Button, Textarea } from '../components/ui/UIComponents';
import { Mail, Send, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useAuth } from '../contexts/AuthContext';

const Contact: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    title: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    try {
      const serviceId = process.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = process.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS Configuration Missing");
      }

      // Prepare the parameters exactly as they appear in the EmailJS template
      const templateParams = {
        name: formData.name,
        email: formData.email,
        title: formData.title,
        message: formData.message,
        time: new Date().toLocaleString()
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      setStatus('success');
      setFormData({ ...formData, title: '', message: '' }); // Clear message/title but keep name/email
    } catch (error) {
      console.error("Failed to send message:", error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Contact Support</h2>
           <p className="text-slate-500 text-lg">Have a question or feedback? Send a message directly to the developers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Card */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
           <CardContent className="p-8 flex flex-col h-full justify-between">
              <div>
                 <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50">
                    <Mail className="h-6 w-6 text-white" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">Get in touch</h3>
                 <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                    We value your feedback. Whether you found a bug, have a feature request, or just want to say hi, our inbox is open.
                 </p>
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                       <MessageSquare className="h-4 w-4" />
                    </div>
                    <span>Response time: &lt; 24 hours</span>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="md:col-span-2">
           <CardContent className="p-8">
              {status === 'success' ? (
                 <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95">
                    <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                       <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                       Thank you for reaching out, {formData.name}. We have received your message and will get back to you shortly at {formData.email}.
                    </p>
                    <Button onClick={() => setStatus('idle')} variant="outline">
                       Send Another Message
                    </Button>
                 </div>
              ) : (
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input 
                          label="Your Name" 
                          placeholder="John Doe"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                       <Input 
                          label="Email Address" 
                          type="email"
                          placeholder="john@example.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                       />
                    </div>
                    
                    <Input 
                       label="Subject" 
                       placeholder="What is this regarding?"
                       required
                       value={formData.title}
                       onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />

                    <Textarea 
                       label="Message" 
                       placeholder="Type your message here..."
                       className="min-h-[150px]"
                       required
                       value={formData.message}
                       onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />

                    {status === 'error' && (
                       <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <AlertCircle className="h-4 w-4" />
                          Failed to send message. Please try again later.
                       </div>
                    )}

                    <div className="flex justify-end">
                       <Button type="submit" size="lg" isLoading={isLoading} className="w-full md:w-auto">
                          <Send className="mr-2 h-4 w-4" /> Send Message
                       </Button>
                    </div>
                 </form>
              )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
