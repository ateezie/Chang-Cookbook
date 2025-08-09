# Recipe Website Development Prompt

I want to create a simple, modern recipe website in the directory `E:\Projects\chang-cookbook`. Please coordinate with my available sub-agents to build this project.

**IMPORTANT**: This should be a modern React/Next.js web application with interactive features, NOT static HTML files. Do not create individual HTML recipe files - build a proper web application with components, routing, and dynamic functionality.

**EXISTING WORK**: There are already some files in this directory from a previous attempt. Please examine the existing code and use it as a starting point, improving and building upon what's already there rather than starting from scratch.

## Project Overview
Create a clean, responsive recipe website that allows users to browse, search, and view detailed recipe information. The site should be modern, user-friendly, and mobile-responsive.

## Sub-Agent Coordination
Please work with these available agents in `.claude/agents`:
- **frontend-developer**: Handle all technical implementation, React/Next.js setup, component architecture
- **recipe-researcher**: Curate and provide recipe content, ingredient lists, cooking instructions, and recipe categories
- **ui-ux-designer**: Design the user interface, create wireframes, define color schemes, typography, and user experience flow
- **code-reviewer**: Review code quality, best practices, performance optimizations, and maintainability
- **debugger**: Identify and fix bugs, troubleshoot issues, and ensure code reliability
- **error-detective**: Investigate errors, analyze stack traces, and provide solutions for technical problems
- **javascript-pro**: Handle advanced JavaScript/React patterns, optimization, and modern ES6+ features

## Core Features Required
1. **Homepage**: Hero section with featured recipes and navigation
2. **Recipe Browsing**: Grid/card layout showing recipe previews with images
3. **Recipe Detail Pages**: Individual pages with ingredients, instructions, cooking time, servings
4. **Search Functionality**: Search recipes by name or ingredients
5. **Categories**: Filter recipes by type (appetizers, main courses, desserts, etc.)
6. **Responsive Design**: Mobile-first approach that works on all screen sizes

## Technical Specifications
- Use React/Next.js for the frontend framework (create a proper web application, not static HTML)
- Implement responsive CSS (Tailwind CSS preferred)
- Use modern JavaScript (ES6+) with React components and hooks
- Include proper semantic HTML for accessibility
- Optimize for performance and SEO
- Store recipe data in JSON files initially (no backend required for MVP)
- Create dynamic pages with routing, search, and filtering functionality

## Content Requirements
- Include 15-20 diverse recipes across different categories
- Each recipe should have: title, description, ingredients list, step-by-step instructions, prep time, cook time, servings, difficulty level, and high-quality image URL
- Ensure recipes are beginner-friendly with clear instructions

## Design Guidelines
- **Brand Identity**: Use the provided Chang Cookbook logo as the primary brand element
- **Color Scheme**: Match the warm aesthetic from the logo - browns (#4a3429, #6b4f3a), oranges (#ff9966, #ffab80), and warm background tones
- **Logo Integration**: Incorporate the circular logo with the chef character prominently in the header/navigation
- **Typography**: Use fonts that complement the friendly, approachable brand personality
- Clean, modern aesthetic with food-focused imagery
- Use the warm, inviting color palette from the Chang Cookbook brand
- Ensure excellent typography and readability
- Include hover effects and smooth transitions
- Design should be intuitive and accessible
- Personal, welcoming feel that matches the chef character in the logo

## Deliverables
1. Complete project structure and file organization
2. Responsive HTML/CSS/JavaScript implementation
3. Recipe data in structured JSON format
4. README with setup and deployment instructions
5. Basic SEO optimization

## Coordination Instructions
1. **Start with UI/UX Designer**: Create wireframes and design system that incorporates the Chang Cookbook brand
2. **Recipe Researcher**: Develop content strategy and curate recipes
3. **Frontend Developer + JavaScript Pro**: Implement the technical solution based on designs and content
4. **Code Reviewer**: Review implementation for best practices and performance
5. **Error Detective + Debugger**: Test functionality and resolve any issues

Please begin by having each agent outline their approach, then coordinate the development process step by step with proper code review and testing at each stage.