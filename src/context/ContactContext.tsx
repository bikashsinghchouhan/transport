'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_OFFICE_ADDRESS,
  DEFAULT_OFFICE_MAP_URL,
  DEFAULT_OFFICE_MAP_EMBED_URL,
} from '@/utils/mapUtils';

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  address: string;
  email: string;
  officeMapUrl: string;
  officeMapEmbedUrl: string;
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
  address: DEFAULT_OFFICE_ADDRESS,
  email: 'support@b2transport.in',
  officeMapUrl: DEFAULT_OFFICE_MAP_URL,
  officeMapEmbedUrl: DEFAULT_OFFICE_MAP_EMBED_URL,
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
          officeMapUrl: data.config.officeMapUrl || defaultContact.officeMapUrl,
          officeMapEmbedUrl: data.config.officeMapEmbedUrl || defaultContact.officeMapEmbedUrl,
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
