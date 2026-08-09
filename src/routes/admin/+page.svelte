<script lang="ts">
  import { onMount } from 'svelte';
  import type { AdminGame, AdminItem, AdminPlayable, AdminUser } from '$lib/admin/types';

  let activeSection = $state<'users' | 'games'>('users');
  let searchQuery = $state('');
  let userResults = $state<AdminUser[]>([]);
  let gameResults = $state<AdminGame[]>([]);
  let selectedUser = $state<AdminUser | null>(null);
  let selectedGame = $state<AdminGame | null>(null);
  let selectedPlayable = $state<AdminPlayable | null>(null);
  let selectedItem = $state<AdminItem | null>(null);
  let playables = $state<AdminPlayable[]>([]);
  let items = $state<AdminItem[]>([]);
  let userDraft = $state({ username: '', telegram_id: '', password: '', role: 'user' as 'user' | 'admin' });
  let gameDraft = $state({ name: '', description: '', hosts: '', version: '' });
  let playableDraft = $state({ name: '', teams: '', icon: '', description: '' });
  let itemDraft = $state({ name: '', description: '', price: 0 });
  let uploadMessage = $state('');
  let uploadFile = $state<File | null>(null);

  function selectSection(section: 'users' | 'games') {
    activeSection = section;
  }

  async function submitSearch(event?: Event) {
    event?.preventDefault();
    if (activeSection === 'users') {
      await searchUsers();
      return;
    }

    await searchGames();
  }

  async function searchUsers() {
    const query = encodeURIComponent(searchQuery);
    const response = await fetch(`/api/admin/search/users?query=${query}`);
    userResults = await response.json();
  }

  async function searchGames() {
    const query = encodeURIComponent(searchQuery);
    const response = await fetch(`/api/admin/search/games?query=${query}`);
    gameResults = await response.json();
  }

  function syncUserForm(user: AdminUser | null) {
    if (!user) {
      userDraft = { username: '', telegram_id: '', password: '', role: 'user' };
      return;
    }

    userDraft = {
      username: user.username,
      telegram_id: user.telegram_id,
      password: '',
      role: user.role
    };
  }

  function syncGameForm(game: AdminGame | null) {
    if (!game) {
      gameDraft = { name: '', description: '', hosts: '', version: '' };
      return;
    }

    gameDraft = {
      name: game.name,
      description: game.description,
      hosts: game.hosts,
      version: game.version
    };
  }

  function syncPlayableForm(playable: AdminPlayable | null) {
    if (!playable) {
      playableDraft = { name: '', teams: '', icon: '', description: '' };
      return;
    }

    playableDraft = {
      name: playable.name,
      teams: playable.teams,
      icon: playable.icon,
      description: playable.description
    };
  }

  function syncItemForm(item: AdminItem | null) {
    if (!item) {
      itemDraft = { name: '', description: '', price: 0 };
      return;
    }

    itemDraft = {
      name: item.name,
      description: item.description,
      price: item.price
    };
  }

  async function selectUser(user: AdminUser) {
    selectedUser = user;
    syncUserForm(user);
  }

  async function selectGame(game: AdminGame) {
    selectedGame = game;
    syncGameForm(game);
    const [playablesResponse, itemsResponse] = await Promise.all([
      fetch(`/api/admin/games/${game.id}/playables`),
      fetch(`/api/admin/games/${game.id}/items`)
    ]);

    playables = await playablesResponse.json();
    items = await itemsResponse.json();
    selectedPlayable = null;
    selectedItem = null;
    syncPlayableForm(null);
    syncItemForm(null);
  }

  async function selectPlayable(playable: AdminPlayable) {
    selectedPlayable = playable;
    syncPlayableForm(playable);
  }

  async function selectItem(item: AdminItem) {
    selectedItem = item;
    syncItemForm(item);
  }

  async function saveUser() {
    if (!selectedUser) return;

    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: userDraft.username,
        telegram_id: userDraft.telegram_id,
        role: userDraft.role,
        password: userDraft.password || undefined
      })
    });

    const payload = await response.json();
    if (payload.user) {
      userResults = userResults.map((user) => (user.id === payload.user.id ? payload.user : user));
      selectedUser = payload.user;
      syncUserForm(payload.user);
    }
  }

  async function saveGame() {
    if (!selectedGame) return;

    const response = await fetch(`/api/admin/games/${selectedGame.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(gameDraft)
    });

    const payload = await response.json();
    if (payload.game) {
      gameResults = gameResults.map((game) => (game.id === payload.game.id ? payload.game : game));
      selectedGame = payload.game;
      syncGameForm(payload.game);
    }
  }

  async function savePlayable() {
    if (!selectedGame) return;

    const endpoint = selectedPlayable ? `/api/admin/playables/${selectedPlayable.id}` : `/api/admin/games/${selectedGame.id}/playables`;
    const method = selectedPlayable ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: playableDraft.name,
        teams: playableDraft.teams,
        icon: playableDraft.icon,
        description: playableDraft.description
      })
    });

    const payload = await response.json();
    if (payload.playable) {
      selectedPlayable = payload.playable;
      syncPlayableForm(payload.playable);
      playables = playables.some((playable) => playable.id === payload.playable.id)
        ? playables.map((playable) => (playable.id === payload.playable.id ? payload.playable : playable))
        : [...playables, payload.playable];
    }
  }

  async function saveItem() {
    if (!selectedGame) return;

    const endpoint = selectedItem ? `/api/admin/items/${selectedItem.id}` : `/api/admin/games/${selectedGame.id}/items`;
    const method = selectedItem ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: itemDraft.name,
        description: itemDraft.description,
        price: Number(itemDraft.price)
      })
    });

    const payload = await response.json();
    if (payload.item) {
      selectedItem = payload.item;
      syncItemForm(payload.item);
      items = items.some((item) => item.id === payload.item.id)
        ? items.map((item) => (item.id === payload.item.id ? payload.item : item))
        : [...items, payload.item];
    }
  }

  async function handleUpload(event: Event) {
    event.preventDefault();
    if (!selectedGame || !uploadFile) return;

    const formData = new FormData();
    formData.append('asset', uploadFile);

    const response = await fetch(`/api/admin/games/${selectedGame.id}/upload`, {
      method: 'POST',
      body: formData
    });

    const payload = await response.json();
    uploadMessage = payload.message ?? 'Upload finished.';
  }

  onMount(() => {
    userResults = [];
    gameResults = [];
  });
</script>

<svelte:head>
  <title>Admin dashboard</title>
</svelte:head>

<div class="dashboard">
  <header class="header-card">
    <div>
      <p class="eyebrow">Operations console</p>
      <h2>Manage users and games</h2>
    </div>
    <a class="logout-link" href="/api/admin/logout">Sign out</a>
  </header>

  <section class="workspace-grid">
    <aside class="side-panel">
      <div class="panel-card">
        <div class="panel-header">
          <h3>Sections</h3>
        </div>
        <div class="section-buttons">
          <button class:active={activeSection === 'users'} onclick={() => selectSection('users')}>Users</button>
          <button class:active={activeSection === 'games'} onclick={() => selectSection('games')}>Games</button>
        </div>
      </div>

      <form class="panel-card search-form" onsubmit={(event) => void submitSearch(event)}>
        <div class="panel-header">
          <h3>Search</h3>
        </div>
        <input bind:value={searchQuery} placeholder={activeSection === 'users' ? 'Search users…' : 'Search games…'} />
        <button class="save-button" type="submit">Search</button>
      </form>

      {#if activeSection === 'users'}
        <div class="panel-card">
          <div class="panel-header">
            <h3>Users</h3>
          </div>
          {#if userResults.length}
            <ul class="list-stack">
              {#each userResults as user}
                <li>
                  <button class="list-button" onclick={() => void selectUser(user)}>
                    <strong>{user.username}</strong>
                    <span>{user.telegram_id}</span>
                  </button>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="empty-state">No users matched the current search.</p>
          {/if}
        </div>
      {:else}
        <div class="panel-card">
          <div class="panel-header">
            <h3>Games</h3>
          </div>
          {#if gameResults.length}
            <ul class="list-stack">
              {#each gameResults as game}
                <li>
                  <button class="list-button" onclick={() => void selectGame(game)}>
                    <strong>{game.name}</strong>
                    <span>{game.version}</span>
                  </button>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="empty-state">No games matched the current search.</p>
          {/if}
        </div>
      {/if}
    </aside>

    <section class="main-panel">
      {#if activeSection === 'users'}
        <div class="panel-card">
          <div class="panel-header">
            <h3>User editor</h3>
          </div>
          {#if selectedUser}
            <div class="form-grid">
              <label>
                Username
                <input bind:value={userDraft.username} />
              </label>
              <label>
                Telegram ID
                <input bind:value={userDraft.telegram_id} />
              </label>
              <label>
                Password
                <input bind:value={userDraft.password} type="password" placeholder="Leave blank to keep current" />
              </label>
              <label>
                Role
                <select bind:value={userDraft.role}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <button class="save-button" onclick={() => void saveUser()}>Save user</button>
          {:else}
            <p class="empty-state">Choose a user from the list to edit their profile.</p>
          {/if}
        </div>
      {:else}
        <div class="panel-card">
          <div class="panel-header">
            <h3>Game editor</h3>
          </div>
          {#if selectedGame}
            <div class="form-grid">
              <label>
                Name
                <input bind:value={gameDraft.name} />
              </label>
              <label>
                Version
                <input bind:value={gameDraft.version} />
              </label>
              <label>
                Hosts
                <input bind:value={gameDraft.hosts} />
              </label>
              <label class="wide">
                Description
                <textarea bind:value={gameDraft.description} rows="4"></textarea>
              </label>
            </div>
            <button class="save-button" onclick={() => void saveGame()}>Save game</button>

            <div class="subsection-stack">
              <div class="subsection-card">
                <div class="panel-header">
                  <h3>Playables</h3>
                </div>
                <div class="list-stack">
                  {#each playables as playable}
                    <button class="list-button" onclick={() => void selectPlayable(playable)}>
                      <strong>{playable.name}</strong>
                      <span>{playable.teams}</span>
                    </button>
                  {/each}
                </div>
                <div class="form-grid compact">
                  <label>
                    Name
                    <input bind:value={playableDraft.name} />
                  </label>
                  <label>
                    Teams
                    <input bind:value={playableDraft.teams} />
                  </label>
                  <label>
                    Icon
                    <input bind:value={playableDraft.icon} />
                  </label>
                  <label class="wide">
                    Description
                    <textarea bind:value={playableDraft.description} rows="3"></textarea>
                  </label>
                </div>
                <button class="save-button" onclick={() => void savePlayable()}>Save playable</button>
              </div>

              <div class="subsection-card">
                <div class="panel-header">
                  <h3>Items</h3>
                </div>
                <div class="list-stack">
                  {#each items as item}
                    <button class="list-button" onclick={() => void selectItem(item)}>
                      <strong>{item.name}</strong>
                      <span>{item.price} points</span>
                    </button>
                  {/each}
                </div>
                <div class="form-grid compact">
                  <label>
                    Name
                    <input bind:value={itemDraft.name} />
                  </label>
                  <label>
                    Price
                    <input bind:value={itemDraft.price} type="number" />
                  </label>
                  <label class="wide">
                    Description
                    <textarea bind:value={itemDraft.description} rows="3"></textarea>
                  </label>
                </div>
                <button class="save-button" onclick={() => void saveItem()}>Save item</button>
              </div>

              <div class="subsection-card">
                <div class="panel-header">
                  <h3>Upload</h3>
                </div>
                <form onsubmit={handleUpload} class="upload-form">
                  <input type="file" onchange={(event) => (uploadFile = (event.currentTarget as HTMLInputElement).files?.[0] ?? null)} />
                  <button class="save-button" type="submit">Upload asset</button>
                </form>
                {#if uploadMessage}
                  <p class="success-message">{uploadMessage}</p>
                {/if}
              </div>
            </div>
          {:else}
            <p class="empty-state">Choose a game from the list to unlock the playable, item, and upload controls.</p>
          {/if}
        </div>
      {/if}
    </section>
  </section>
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .header-card,
  .panel-card,
  .subsection-card {
    background: rgba(243, 241, 232, 0.95);
    color: #273338;
    border-radius: 20px;
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
  }

  .header-card {
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .eyebrow {
    margin: 0 0 0.35rem;
    text-transform: uppercase;
    letter-spacing: 0.21em;
    font-size: 0.75rem;
    color: #618764;
  }

  h2,
  h3 {
    margin: 0;
  }

  .logout-link {
    color: #2b5748;
    text-decoration: none;
    font-weight: 600;
  }

  .workspace-grid {
    display: grid;
    grid-template-columns: minmax(280px, 320px) 1fr;
    gap: 1rem;
  }

  .side-panel,
  .main-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .panel-card,
  .subsection-card {
    padding: 1rem;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.85rem;
  }

  .section-buttons {
    display: flex;
    gap: 0.6rem;
  }

  button {
    border: 0;
    cursor: pointer;
    border-radius: 999px;
    padding: 0.7rem 0.9rem;
    background: #9cb080;
    color: #273338;
    font-weight: 600;
  }

  button.active {
    background: #2b5748;
    color: white;
  }

  input,
  textarea,
  select {
    width: 100%;
    border-radius: 12px;
    border: 1px solid #9cb080;
    padding: 0.7rem 0.8rem;
    box-sizing: border-box;
    margin-top: 0.35rem;
    font: inherit;
  }

  .form-grid {
    display: grid;
    gap: 0.8rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-grid.compact {
    grid-template-columns: 1fr 1fr;
  }

  .wide {
    grid-column: 1 / -1;
  }

  label {
    display: flex;
    flex-direction: column;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .save-button {
    margin-top: 0.9rem;
    background: #2b5748;
    color: white;
  }

  .subsection-stack {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
  }

  .list-stack {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    list-style: none;
    margin: 0 0 0.8rem;
    padding: 0;
  }

  .list-button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 12px;
    background: #f3f1e8;
    border: 1px solid #d6ddc5;
    color: #273338;
  }

  .empty-state {
    color: #618764;
    margin: 0;
  }

  .upload-form {
    display: grid;
    gap: 0.75rem;
  }

  .success-message {
    margin: 0.75rem 0 0;
    color: #2b5748;
    font-weight: 600;
  }

  @media (max-width: 960px) {
    .workspace-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
