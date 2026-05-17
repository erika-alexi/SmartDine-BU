import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../app/contexts/AuthContext';
import React from 'react';

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Login System Unit Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Admin Login Tests', () => {
    it('should reject hard-coded demo admin credentials in production mode', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.login('admin', 'admin123', 'admin');
      });

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with incorrect admin username', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login('wrongadmin', 'admin123', 'admin');

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with incorrect admin password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login('admin', 'wrongpassword', 'admin');

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with empty admin username', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login('', 'admin123', 'admin');

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with empty admin password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login('admin', '', 'admin');

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with both empty username and password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login('', '', 'admin');

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('User Login Tests', () => {
    beforeEach(() => {
      // Setup test user in localStorage
      const testUsers = [
        {
          id: 'user-1',
          name: 'John Dela Cruz',
          email: 'jdc2024-1234-56789@bicol-u.edu.ph',
          password: 'password123',
          role: 'student',
          studentId: '2024-1234-56789',
        },
      ];
      localStorage.setItem('smartdine_users', JSON.stringify(testUsers));
    });

    it('should successfully login with correct user email and password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.login(
          'jdc2024-1234-56789@bicol-u.edu.ph',
          'password123',
          'user'
        );
      });

      expect(loginResult).toBe(true);
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual({
          id: 'user-1',
          name: 'John Dela Cruz',
          email: 'jdc2024-1234-56789@bicol-u.edu.ph',
          role: 'student',
          studentId: '2024-1234-56789',
        });
      });
    });

    it('should fail login with incorrect user email', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login(
        'abc2024-9999-99999@bicol-u.edu.ph',
        'password123',
        'user'
      );

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with incorrect user password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login(
        'jdc2024-1234-56789@bicol-u.edu.ph',
        'wrongpassword',
        'user'
      );

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with empty user email', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login('', 'password123', 'user');

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with empty user password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login(
        'jdc2024-1234-56789@bicol-u.edu.ph',
        '',
        'user'
      );

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with both empty email and password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login('', '', 'user');

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with invalid BU email format', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login(
        'invalid@gmail.com',
        'password123',
        'user'
      );

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fail login with incorrect BU email format (missing required parts)', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResult = await result.current.login(
        'jdc@bicol-u.edu.ph',
        'password123',
        'user'
      );

      expect(loginResult).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Authentication State Tests', () => {
    it('should maintain authentication state in localStorage', async () => {
      localStorage.setItem('smartdine_users', JSON.stringify([{
        id: 'user-1',
        name: 'John Dela Cruz',
        email: 'jdc2024-1234-56789@bicol-u.edu.ph',
        password: 'password123',
        role: 'student',
        studentId: '2024-1234-56789',
      }]));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('jdc2024-1234-56789@bicol-u.edu.ph', 'password123', 'user');
      });

      await waitFor(() => {
        const savedUser = localStorage.getItem('smartdine_user');
        expect(savedUser).toBeTruthy();
        expect(JSON.parse(savedUser!)).toEqual({
          id: 'user-1',
          name: 'John Dela Cruz',
          email: 'jdc2024-1234-56789@bicol-u.edu.ph',
          role: 'student',
          studentId: '2024-1234-56789',
        });
      });
    });

    it('should clear authentication state on logout', async () => {
      localStorage.setItem('smartdine_users', JSON.stringify([{
        id: 'user-1',
        name: 'John Dela Cruz',
        email: 'jdc2024-1234-56789@bicol-u.edu.ph',
        password: 'password123',
        role: 'student',
        studentId: '2024-1234-56789',
      }]));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('jdc2024-1234-56789@bicol-u.edu.ph', 'password123', 'user');
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('smartdine_user')).toBeNull();
      });
    });
  });
});
