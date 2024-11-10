<template>
  <div class="function-card">
    <div class="content">
      <h3 class="method-name">{{ methodName }}</h3>
      <p class="method-return-type">Return Type: {{ returnType }}</p>
      <p class="method-output">{{ processedOutput }}</p>
    </div>
    <div class="buttons">
      <div class="button-wrapper">
        <button
          @click="copyToClipboard(methodName, 'method')"
          class="btn btn-method"
        >
          <FontAwesomeIcon :icon="['far', 'copy']" /> Copy Method
        </button>
        <span v-if="showMethodTooltip" class="tooltip">Copied!</span>
      </div>
      <div class="button-wrapper">
        <button
          @click="copyToClipboard(processedOutput, 'output')"
          :disabled="isOutputEmpty"
          class="btn btn-output"
        >
          <FontAwesomeIcon :icon="['far', 'copy']" /> Copy Output
        </button>
        <span v-if="showOutputTooltip" class="tooltip">Copied!</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, watch } from "vue";

export default {
  name: "FunctionCard",
  props: {
    inputValue: {
      type: String,
      required: true,
    },
    methodName: {
      type: String,
      required: true,
    },
    processingFunction: {
      type: Function as PropType<(input: string) => any>,
      required: true,
    },
  },
  setup(props) {
    // Reactive refs
    const returnType = ref("");
    const showMethodTooltip = ref(false);
    const showOutputTooltip = ref(false);
    const lastProcessedValue = ref("");

    // Computed properties
    const processedOutput = computed(() => {
      if (!props.inputValue || !props.processingFunction) {
        return "";
      }

      try {
        const result = props.processingFunction(props.inputValue);
        lastProcessedValue.value = result;
        return result;
      } catch (error) {
        console.error(`Error processing ${props.methodName}:`, error);
        return "Error processing date";
      }
    });

    const isOutputEmpty = computed(() => {
      return processedOutput.value === "";
    });
    // Watch for changes in input value to force refresh
    watch(
      () => props.inputValue,
      () => {
        // The computed property will automatically re-evaluate
      },
      { immediate: true }
    );

    // Clipboard functionality
    const copyToClipboard = async (
      text: string | undefined,
      type: "method" | "output"
    ) => {
      if (!text) return;

      const tooltipRef =
        type === "method" ? showMethodTooltip : showOutputTooltip;
      const formattedText = type === "method" ? `${text}()` : text;

      try {
        await navigator.clipboard.writeText(formattedText);
        tooltipRef.value = true;
        setTimeout(() => {
          tooltipRef.value = false;
        }, 1500);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    };

    // Force immediate evaluation of return type
    returnType.value = typeof processedOutput.value;

    return {
      processedOutput,
      returnType,
      copyToClipboard,
      showMethodTooltip,
      showOutputTooltip,
      isOutputEmpty,
    };
  },
};
</script>

<style scoped>
.function-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.function-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
}

.content {
  flex-grow: 2;
  display: flex;
  flex-direction: column;
}

.method-name {
  font-size: clamp(20px, 1.5vw, 36px);
  text-align: center;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.method-output {
  font-size: 1rem;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  word-break: break-word;
  line-height: 1.6;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  flex-grow: 1;
}

.method-return-type {
  font-size: 0.9rem;
  color: #e0e0e0;
  margin: auto;
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.button-wrapper {
  position: relative;
  flex: 1;
}

.btn {
  width: 100%;
  padding: 0.5rem 0.75rem;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Poppins", sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: all 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-method {
  background-color: #4caf50;
}

.btn-output {
  background-color: #2196f3;
}

.btn:active {
  transform: scale(0.98);
}

.btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  animation: fadeInOut 1.5s ease-in-out forwards;
}

@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0;
  }
  10%,
  90% {
    opacity: 1;
  }
}
</style>
