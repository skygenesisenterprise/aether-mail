import React, { useState } from 'react';
import EmailList, { type Email } from './EmailList';
import EmailViewer from './EmailViewer';
import EmailComposer from './EmailComposer';
import { generateId } from '../../lib/utils';

// Sample emails for demonstration
const SAMPLE_EMAILS: Email[] = [
  {
    id: generateId(),
    from: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      verified: true
    },
    subject: 'Welcome to Aether Mail - Your Secure Email Service',
    body: `Hello there,

Welcome to Aether Mail, your new secure and private email service! We're thrilled to have you join our community of privacy-conscious users.

Aether Mail is designed with your privacy and security as our top priorities. Here are some key features you can enjoy:

- End-to-end encryption for all your sensitive communications
- Zero-knowledge architecture that prevents even us from accessing your emails
- Modern, clean interface that makes email management a breeze
- Advanced spam filtering that keeps your inbox clean
- Complete control over your data, with easy export and deletion options

We recommend exploring the settings to customize your experience and enable additional security features like two-factor authentication.

If you have any questions or feedback, please don't hesitate to reach out to our support team. We're here to help!

Best regards,
The Aether Mail Team`,
    timestamp: new Date(Date.now() - 3600000 * 2),
    isRead: false,
    isStarred: true,
    isEncrypted: true,
    hasAttachments: false,
    labels: ['Welcome', 'Important']
  },
  {
    id: generateId(),
    from: {
      name: 'Aether Mail Security',
      email: 'security@aethermail.com',
      verified: true
    },
    subject: 'Your account security settings',
    body: `Hello,

We've noticed that you haven't set up two-factor authentication (2FA) for your Aether Mail account yet. We strongly recommend enabling this additional security layer to protect your account.

With 2FA, even if someone gets your password, they won't be able to access your account without the second verification method.

To set up 2FA:
1. Go to Settings > Security
2. Select "Enable Two-Factor Authentication"
3. Follow the setup instructions

If you need any help with this process, please reply to this email or contact our support team.

Stay secure,
Aether Mail Security Team`,
    timestamp: new Date(Date.now() - 3600000 * 12),
    isRead: true,
    isStarred: false,
    isEncrypted: true,
    hasAttachments: false,
    labels: ['Security']
  },
  {
    id: generateId(),
    from: {
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      verified: false
    },
    subject: 'Project proposal and timeline',
    body: `Hi there,

I've attached the project proposal we discussed in our meeting last week. Please review it and let me know if you have any questions or suggestions for changes.

Here's a quick summary of our timeline:
- Week 1-2: Research and planning
- Week 3-4: Initial development and prototyping
- Week 5-6: Testing and refinement
- Week 7-8: Final review and launch

I'm excited to work on this project together and believe we can deliver excellent results within the proposed timeframe.

Best regards,
Alice`,
    timestamp: new Date(Date.now() - 3600000 * 24),
    isRead: true,
    isStarred: true,
    isEncrypted: false,
    hasAttachments: true,
    labels: ['Work']
  },
  {
    id: generateId(),
    from: {
      name: 'Robert Chen',
      email: 'robert.chen@example.com',
      verified: true
    },
    subject: 'Invitation: Team Building Event',
    body: `Hello team,

I'm pleased to invite you to our quarterly team building event, which will take place on Saturday, May 15th, from 10:00 AM to 3:00 PM at Lakeside Park.

We've planned a day full of fun activities including:
- Team challenges and games
- Barbecue lunch
- Informal networking session
- Awards ceremony for Q1 achievements

Please RSVP by replying to this email by May 5th, and let me know if you have any dietary restrictions or accessibility requirements we should accommodate.

Looking forward to seeing everyone there!

Best,
Robert`,
    timestamp: new Date(Date.now() - 3600000 * 36),
    isRead: false,
    isStarred: false,
    isEncrypted: true,
    hasAttachments: false,
    labels: ['Social', 'Work']
  },
  {
    id: generateId(),
    from: {
      name: 'Newsletter',
      email: 'newsletter@tech-updates.com',
      verified: false
    },
    subject: 'This Week in Tech: Latest Updates and Trends',
    body: `Tech News Weekly Roundup

AI BREAKTHROUGHS
- Google announces new language model with improved reasoning capabilities
- OpenAI releases API for DALL-E 3 with enhanced image generation

CYBERSECURITY UPDATES
- Major vulnerability patched in popular VPN service
- New zero-day exploit discovered in Windows systems
- Ransomware attacks decreased by 15% in the first quarter

INDUSTRY MOVES
- Apple acquires AI startup focused on voice recognition
- Twitter announces new features for premium subscribers
- Meta's Reality Labs continues to lose money despite VR push

UPCOMING EVENTS
- Developer Conference 2023 (June 12-15)
- Cybersecurity Summit (May 23-24)
- Open Source Convention (July 7-9)

To unsubscribe from these updates, click here.`,
    timestamp: new Date(Date.now() - 3600000 * 48),
    isRead: true,
    isStarred: false,
    isEncrypted: false,
    hasAttachments: false,
    labels: ['Newsletter']
  }
];

const EmailInbox: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>(SAMPLE_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view on component mount and window resize
  React.useEffect(() => {
    const checkForMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkForMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkForMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkForMobile);
  }, []);

  // Handle email selection
  const handleSelectEmail = (emailToSelect: Email) => {
    // Mark as read when selecting
    if (!emailToSelect.isRead) {
      const updatedEmails = emails.map(e =>
        e.id === emailToSelect.id ? { ...e, isRead: true } : e
      );
      setEmails(updatedEmails);

      // Create a new object with isRead set to true
      const updatedEmail = { ...emailToSelect, isRead: true };
      setSelectedEmail(updatedEmail);
    } else {
      setSelectedEmail(emailToSelect);
    }
  };

  // Handle starring emails
  const handleStarEmail = (email: Email) => {
    const updatedEmails = emails.map(e =>
      e.id === email.id ? { ...e, isStarred: !e.isStarred } : e
    );
    setEmails(updatedEmails);

    if (selectedEmail && selectedEmail.id === email.id) {
      setSelectedEmail({ ...selectedEmail, isStarred: !selectedEmail.isStarred });
    }
  };

  // Handle deleting emails
  const handleDeleteEmail = (email: Email) => {
    // In a real app, this would send a request to the server
    const updatedEmails = emails.filter(e => e.id !== email.id);
    setEmails(updatedEmails);
    setSelectedEmail(null);
  };

  // Handle replying to emails
  const handleReplyEmail = (email: Email) => {
    setIsComposerOpen(true);
  };

  // Handle forwarding emails
  const handleForwardEmail = (email: Email) => {
    setIsComposerOpen(true);
  };

  // Close the selected email on mobile
  const handleCloseEmailView = () => {
    setSelectedEmail(null);
  };

  return (
    <div className="flex h-full">
      {/* Email List - hidden on mobile when an email is selected */}
      <div
        className={`flex-1 ${isMobileView && selectedEmail ? 'hidden' : 'block'} md:block md:w-96 md:flex-none`}
      >
        <EmailList
          emails={emails}
          onSelectEmail={handleSelectEmail}
          selectedEmailId={selectedEmail?.id || null}
        />
      </div>

      {/* Email Viewer */}
      {isMobileView ? (
        // Mobile view
        selectedEmail && (
          <EmailViewer
            email={selectedEmail}
            onClose={handleCloseEmailView}
            onStar={handleStarEmail}
            onDelete={handleDeleteEmail}
            onReply={handleReplyEmail}
            onForward={handleForwardEmail}
            isMobile={true}
          />
        )
      ) : (
        // Desktop view
        <div className="hidden flex-1 md:block">
          <EmailViewer
            email={selectedEmail}
            onStar={handleStarEmail}
            onDelete={handleDeleteEmail}
            onReply={handleReplyEmail}
            onForward={handleForwardEmail}
          />
        </div>
      )}

      {/* Composer Modal */}
      <EmailComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        initialTo={selectedEmail ? selectedEmail.from.email : ''}
        initialSubject={selectedEmail ? `Re: ${selectedEmail.subject}` : ''}
        replyToEmail={!!selectedEmail}
      />

      {/* Floating Compose Button (Mobile) */}
      <button
        className="fixed bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-aether-primary shadow-lg hover:bg-aether-accent focus:outline-none md:hidden"
        onClick={() => setIsComposerOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
};

export default EmailInbox;
