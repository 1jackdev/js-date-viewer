<template>
  <div>
    <input type="date" name="datetime" id="datetime-1" :value="props.input" />
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  input: Date,
});
</script>
