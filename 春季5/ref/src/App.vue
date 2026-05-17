<script setup>
  import { ref, computed } from "vue";
  const rooms = ["儒", "释", "道"]; 
  const Index = ref(0); 
  const room = computed(() => rooms[Index.value]);
  function nextRoom() {
    Index.value = (Index.value + 1) % rooms.length;
  }
</script>

<template>
  <button @click="nextRoom">Next room</button>
  <p>Room is: {{ room }}</p>
</template>