'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  address: string;
  email: string;
}

interface ContactContextType {
  contact: ContactInfo;
  loading: boolean;
  updateContact: (newContact: Partial<ContactInfo>) => void;
  refetchContact: () => Promise<void>;
}

const defaultContact: ContactInfo = {
  phone: '7654722708',
  whatsapp: '917654722708',
  address: 'Ranchi, Jharkhand (HQ)',
  email: 'support@b2transport.in',
};

const ContactContext = createContext<ContactContextType>({
  contact: defaultContact,
  loading: false,
  updateContact: () => {},
  refetchContact: async () => {},
});

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  const [loading, setLoading] = useState(true);

  const fetchContact = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.config) {
        setContact({
          phone: data.config.phone || defaultContact.phone,
          whatsapp: data.config.whatsapp || defaultContact.whatsapp,
          address: data.config.address || defaultContact.address,
          email: data.config.email || defaultContact.email,
        });
      }
    } catch (err) {
      console.error('Error loading site config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const updateContact = (newContact: Partial<ContactInfo>) => {
    setContact((prev) => ({ ...prev, ...newContact }));
  };

  return (
    <ContactContext.Provider
      value={{
        contact,
        loading,
        updateContact,
        refetchContact: fetchContact,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () => useContext(ContactContext);
