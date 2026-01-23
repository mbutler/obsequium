---
layout: base.njk
title: Report an Accessibility Issue
description: Report accessibility barriers or request accommodations for University of Iowa Libraries resources and services.
breadcrumbs:
  - label: Home
    href: /
  - label: Report an Accessibility Issue
---

{% pageHeader "Report an Accessibility Issue", "We are committed to ensuring our resources, services, and facilities are accessible to everyone. Use this form to report accessibility barriers or request accommodations." %}

## Our Commitment

The University of Iowa Libraries is committed to providing accessible resources and services to all users, in compliance with Section 504 of the Rehabilitation Act, the Americans with Disabilities Act (ADA), and the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.

If you encounter an accessibility barrier while using our website, facilities, or services, please let us know so we can address it promptly.

## Report an Issue

<form class="form-shell" action="/api/accessibility-report" method="POST" data-validate>
  <div class="form-field">
    <label for="name" class="form-field__label">Your Name</label>
    <input 
      type="text" 
      id="name" 
      name="name" 
      class="form-field__input"
      autocomplete="name"
    >
  </div>

  <div class="form-field">
    <label for="email" class="form-field__label form-field__label--required">Email Address</label>
    <p id="email-hint" class="form-field__hint">We'll use this to follow up on your report.</p>
    <input 
      type="email" 
      id="email" 
      name="email" 
      class="form-field__input"
      required
      autocomplete="email"
      aria-describedby="email-hint"
    >
    <p id="email-error" class="form-field__error" hidden></p>
  </div>

  <div class="form-field">
    <label for="phone" class="form-field__label">Phone Number (optional)</label>
    <input 
      type="tel" 
      id="phone" 
      name="phone" 
      class="form-field__input"
      autocomplete="tel"
    >
  </div>

  <fieldset class="form-fieldset">
    <legend class="form-fieldset__legend">Type of Issue</legend>
    
    <div class="form-choice">
      <input type="radio" id="issue-website" name="issue-type" value="website" class="form-choice__input">
      <label for="issue-website" class="form-choice__label">Website or digital resource barrier</label>
    </div>
    
    <div class="form-choice">
      <input type="radio" id="issue-physical" name="issue-type" value="physical" class="form-choice__input">
      <label for="issue-physical" class="form-choice__label">Physical accessibility barrier</label>
    </div>
    
    <div class="form-choice">
      <input type="radio" id="issue-service" name="issue-type" value="service" class="form-choice__input">
      <label for="issue-service" class="form-choice__label">Service or program accommodation request</label>
    </div>
    
    <div class="form-choice">
      <input type="radio" id="issue-other" name="issue-type" value="other" class="form-choice__input">
      <label for="issue-other" class="form-choice__label">Other accessibility concern</label>
    </div>
  </fieldset>

  <div class="form-field">
    <label for="url" class="form-field__label">Page URL (if applicable)</label>
    <p id="url-hint" class="form-field__hint">Copy and paste the web address where you encountered the issue.</p>
    <input 
      type="url" 
      id="url" 
      name="url" 
      class="form-field__input"
      aria-describedby="url-hint"
    >
  </div>

  <div class="form-field">
    <label for="description" class="form-field__label form-field__label--required">Description of the Issue</label>
    <p id="description-hint" class="form-field__hint">Please describe the barrier you encountered and how it affected your ability to access our resources or services.</p>
    <textarea 
      id="description" 
      name="description" 
      class="form-field__textarea"
      rows="6"
      required
      aria-describedby="description-hint"
    ></textarea>
    <p id="description-error" class="form-field__error" hidden></p>
  </div>

  <div class="form-field">
    <label for="assistive-tech" class="form-field__label">Assistive Technology Used (optional)</label>
    <p id="assistive-tech-hint" class="form-field__hint">Let us know what assistive technology you were using (e.g., screen reader, magnification software, voice recognition).</p>
    <input 
      type="text" 
      id="assistive-tech" 
      name="assistive-tech" 
      class="form-field__input"
      aria-describedby="assistive-tech-hint"
    >
  </div>

  <button type="submit" class="btn btn--primary">Submit Report</button>
</form>

## Alternative Ways to Report

If you prefer not to use the online form, you can contact us directly:

- **Email:** [lib-accessibility@uiowa.edu](mailto:lib-accessibility@uiowa.edu)
- **Phone:** [319-335-5299](tel:+13193355299)
- **In Person:** Visit the Main Library Service Desk at 100 Main Library

## Response Time

We aim to acknowledge all accessibility reports within 2 business days and provide a substantive response or resolution within 10 business days. Complex issues may require additional time, and we will keep you informed of our progress.

## University Resources

- [University of Iowa Accessibility](https://accessibility.uiowa.edu/)
- [Student Disability Services](https://sds.studentlife.uiowa.edu/)
- [ADA Coordinator](https://diversity.uiowa.edu/ada)

## Accessibility Statement

This website has been designed to meet WCAG 2.1 Level AA accessibility standards. We continuously work to improve accessibility and welcome your feedback.

[View our full accessibility statement](/about/accessibility-statement/)
