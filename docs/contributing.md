# Contributing Guide

Guidelines for contributing to IVY LMS.

---

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical production fixes
- `chore/description` - Maintenance tasks

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Build/config changes

**Examples:**
```
feat(assignments): add AI grading for writing tasks

fix(auth): resolve login redirect loop

docs(readme): update setup instructions
```

---

## Code Style

### TypeScript

- Use strict TypeScript configuration
- Avoid `any` type
- Use explicit return types on functions
- Prefer `interface` over `type` for objects

```typescript
// Good
interface UserProps {
  id: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // implementation
}

// Avoid
function getUser(id: any): any {
  // implementation
}
```

### React Components

- Use functional components
- Use Server Components by default
- Add `'use client'` only when needed
- Use named exports

```typescript
// Server Component (default)
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}

// Client Component (when needed)
'use client';

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c + 1)}>{count}</button>;
}
```

### File Organization

```
src/
├── app/
│   └── [route]/
│       ├── page.tsx          # Page component
│       ├── layout.tsx        # Route layout
│       └── loading.tsx       # Loading state
├── components/
│   ├── ui/                   # shadcn components
│   └── features/             # Domain components
│       └── [name]/
│           ├── index.tsx
│           └── [name].test.tsx
├── lib/
│   └── [utility].ts
└── store/
    └── [feature].store.ts
```

---

## ESLint Rules

The project uses strict ESLint configuration:

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'error',
      'eqeqeq': 'error'
    }
  }
];
```

**Key Rules:**
- No console logs in production code
- Strict equality (`===`) required
- Unused variables must start with `_`

---

## Testing

### Test Structure

```typescript
// Component test
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('renders user name', () => {
    render(<UserCard user={{ name: 'John' }} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test UserCard.test.tsx
```

---

## Pull Request Process

1. **Create Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Follow code style guidelines
   - Add tests for new features
   - Update documentation

3. **Commit**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/my-feature
   ```

5. **PR Requirements**
   - Clear title and description
   - Link related issues
   - All tests passing
   - No ESLint errors
   - Code review approval

---

## Code Review Guidelines

### As Author

- Keep PRs focused and small
- Write clear commit messages
- Respond to feedback promptly
- Test your changes thoroughly

### As Reviewer

- Review within 24 hours
- Be constructive in feedback
- Approve when ready
- Request changes clearly

---

## Database Migrations

### Creating Migrations

```bash
# After schema changes
npx prisma migrate dev --name describe_change
```

### Migration Guidelines

- Always review generated migration files
- Test migrations on staging
- Avoid destructive operations in production
- Document breaking changes

---

## Documentation

Update documentation when:

- Adding new features
- Changing APIs
- Modifying environment variables
- Updating deployment process

---

## Questions?

Contact the maintainers:
- **Nghiêm Thành Công** - Full-Stack Developer
