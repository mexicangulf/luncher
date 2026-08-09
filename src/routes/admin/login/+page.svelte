<script lang="ts">
  import { goto } from '$app/navigation';

  let username = $state('');
  let password = $state('');
  let error = $state('');
  let isSubmitting = $state(false);

  async function handleSubmit(event?: Event) {
    event?.preventDefault();
    error = '';
    isSubmitting = true;

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      await goto('/admin?section=users');
      return;
    }

    const payload = await response.json().catch(() => ({ error: 'Unable to sign in.' }));
    error = payload.error ?? 'Unable to sign in.';
    isSubmitting = false;
  }
</script>

<div class="login-page">
  <form class="login-card" onsubmit={(event) => handleSubmit(event)}>
    <p class="eyebrow">Protected area</p>
    <h1>Admin sign in</h1>
    <label for="username">Username</label>
    <input id="username" bind:value={username} type="text" placeholder="Enter admin username" />
    <label for="password">Password</label>
    <input id="password" bind:value={password} type="password" placeholder="Enter admin password" />
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Enter dashboard'}</button>
  </form>
</div>

<style>
  .login-page {
    min-height: calc(100vh - 3rem);
    display: grid;
    place-items: center;
  }

  .login-card {
    width: min(100%, 420px);
    padding: 2rem;
    border-radius: 20px;
    background: rgba(243, 241, 232, 0.95);
    color: #273338;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
  }

  .eyebrow {
    margin: 0 0 0.35rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.75rem;
    color: #618764;
  }

  h1 {
    margin: 0 0 1rem;
    color: #2b5748;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  input {
    width: 100%;
    padding: 0.8rem 0.9rem;
    border-radius: 12px;
    border: 1px solid #9cb080;
    margin-bottom: 0.9rem;
    box-sizing: border-box;
  }

  button {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    background: #2b5748;
    color: white;
    font-weight: 600;
  }

  .error {
    color: #b33c3c;
    margin: 0 0 0.8rem;
  }
</style>
