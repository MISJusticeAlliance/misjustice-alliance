import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { sendContactFormEmail } from '../emailService';
import { TRPCError } from '@trpc/server';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().refine(
    (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
    'Invalid phone number format'
  ),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export const contactRouter = router({
  /**
   * Submit a contact form inquiry
   * Sends email to staff and confirmation to user
   */
  submitInquiry: publicProcedure
    .input(contactFormSchema)
    .mutation(async ({ input }) => {
      try {
        // Validate input
        if (!input.name || !input.email || !input.subject || !input.message) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'All required fields must be provided',
          });
        }

        // Send emails
        const emailSent = await sendContactFormEmail({
          name: input.name,
          email: input.email,
          phone: input.phone,
          subject: input.subject,
          message: input.message,
        });

        if (!emailSent) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send inquiry. Please try again later.',
          });
        }

        return {
          success: true,
          message: 'Your inquiry has been sent successfully. We will respond as soon as possible.',
        };
      } catch (error) {
        console.error('Contact form submission error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while processing your inquiry. Please try again later.',
        });
      }
    }),
});
