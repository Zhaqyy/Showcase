import React from "react";
import { overviewData } from "../../Data/overviewData";

const ContactSection = () => {
  return (
    <div className='contact-section'>
      <h3 id='contact-heading'>Summoning Circle</h3>
      <ul role='list' aria-labelledby='contact-heading'>
        {overviewData.contact.map(contact => (
          <li key={contact.platform}>
            <a 
              href={contact.url} 
              target='_blank' 
              rel='noopener noreferrer' 
              aria-label={`${contact.platform} (opens in new tab)`}
            >
              {contact.platform}
            </a>
          </li>
        ))}
      </ul>
      <div className='availability' aria-live='polite' aria-atomic='true'>
        {overviewData.interaction.collaborationStatus}
      </div>
    </div>
  );
};

export default ContactSection; 