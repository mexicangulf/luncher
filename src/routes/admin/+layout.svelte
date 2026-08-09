<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  const sections = [
    { id: 'users', label: 'Users', href: '/admin?section=users' },
    { id: 'games', label: 'Games', href: '/admin?section=games' }
  ];
</script>

<svelte:head>
  <title>Luncher Admin</title>
</svelte:head>

<div class="admin-shell">
  <aside class="sidebar">
    <div class="brand">
      <h1>Luncher</h1>
      <p>Admin control center</p>
    </div>

    <nav class="nav-links">
      {#each sections as section}
        <a
          class:active={$page.url.searchParams.get('section') === section.id || ($page.url.searchParams.get('section') === null && section.id === 'users')}
          href={section.href}
        >
          {section.label}
        </a>
      {/each}
    </nav>
  </aside>

  <main class="content-panel">
    {@render children?.()}
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #273338;
    color: #f3f1e8;
  }

  .admin-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 260px 1fr;
    background: linear-gradient(135deg, #273338 0%, #2b5748 100%);
  }

  .sidebar {
    padding: 1.5rem;
    background: rgba(39, 51, 56, 0.96);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }

  .brand h1 {
    margin: 0;
    font-size: 1.4rem;
    color: #9cb080;
  }

  .brand p {
    margin: 0.25rem 0 0;
    color: #c9d8bc;
    font-size: 0.95rem;
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    margin-top: 1.5rem;
  }

  .nav-links a {
    text-decoration: none;
    color: #f3f1e8;
    padding: 0.8rem 0.95rem;
    border-radius: 12px;
    transition: background 180ms ease;
  }

  .nav-links a:hover,
  .nav-links a.active {
    background: #618764;
  }

  .content-panel {
    padding: 1.5rem;
  }

  @media (max-width: 900px) {
    .admin-shell {
      grid-template-columns: 1fr;
    }

    .sidebar {
      border-right: 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
  }
</style>
