<script>

    import {onMount} from 'svelte';

    const {user} = $props();

</script>

<div>
    {#if user}
        <pre>{JSON.stringify(user, null, 2)}</pre>
    {:else}
        not logged in
    {/if}
</div>