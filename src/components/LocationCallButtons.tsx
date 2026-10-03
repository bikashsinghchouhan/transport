'use client';

import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { useContact } from '@/context/ContactContext';

interface LocationCallButtonsProps {
  locationName: string;
  stylesActionRowClass: string;
}

export default function LocationCallButtons({ locationName, stylesActionRowClass }: LocationCallButtonsProps) {
  const { contact } = useContact();

  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hi B2 Transport! I saw your page for ${locationName} and I want to inquire about shifting services in my area.`
    );
    return `https://wa.me/${contact.whatsapp}?text=${text}`;
  };

  return (
    <div className={stylesActionRowClass}>
      <a href={`tel:${contact.phone}`} className="btn-neon">
        <Phone size={18} />
        <span>Call: {contact.phone}</span>
      </a>
      <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-secondary">
        <MessageSquare size={18} />
        <span>WhatsApp Booking</span>
      </a>
    </div>
  );
}
