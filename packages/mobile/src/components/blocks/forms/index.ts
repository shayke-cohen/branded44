/**
 * Form & Data Entry Blocks Index - AI-Optimized React Native Component Library
 * 
 * This file exports all form and data entry related block components with comprehensive
 * documentation and examples for AI agents to easily discover and use.
 * 
 * @category Forms
 * @author AI Component System
 * @version 1.0.0
 */

// === FORM COMPONENTS ===

export { default as ContactForm } from './ContactForm';
export type { ContactFormProps, ContactFormData, ContactFormErrors } from './ContactForm';

export { default as SearchForm } from './SearchForm';
export type { 
  SearchFormProps, 
  SearchFormData, 
  SearchFilter, 
  SearchSort 
} from './SearchForm';

// === SHARED TYPES AND CONSTANTS ===

export { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
export { validateEmail, validateField, cn } from '../../../lib/utils';

/**
 * === AI AGENT USAGE GUIDE ===
 * 
 * ## Quick Component Selection Guide
 * 
 * ### For Contact Forms:
 * - Use `ContactForm` for customer inquiries
 * - Supports custom required fields
 * - Built-in validation and error handling
 * 
 * ### For Search & Discovery:
 * - Use `SearchForm` for content search
 * - Supports filters, sorting, and categories
 * - Auto-search with debouncing
 * 
 * ## Common Implementation Patterns
 * 
 * ### Basic Contact Form:
 * ```tsx
 * <ContactForm
 *   onSubmit={(data) => handleContactSubmission(data)}
 *   showOptionalFields={true}
 *   requiredFields={['firstName', 'email', 'message']}
 *   title="Get in Touch"
 * />
 * ```
 * 
 * ### Advanced Search Form:
 * ```tsx
 * <SearchForm
 *   onSearch={(data) => handleSearch(data)}
 *   filters={[
 *     { id: 'price', label: 'Price Range', type: 'range', min: 0, max: 1000 }
 *   ]}
 *   sortOptions={[
 *     { id: 'relevance', label: 'Relevance', field: 'score', direction: 'desc' }
 *   ]}
 *   autoSearch={true}
 * />
 * ```
 */ 