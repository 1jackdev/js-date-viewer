<template>
  <div class="function-card">
    <div class="content">
      <div class="method-card tooltip-container">
        <span
          class="method-tooltip"
          @click="copyToClipboard(processedOutput, 'method')"
          :class="{ 'tooltip-copied': isMethodNameCopied }"
        >
          {{ methodNameTooltipText() }}
        </span>
        <button
          class="btn btn-method"
          @click="copyToClipboard(processedOutput, 'method')"
          @mouseleave="handleMethodNameMouseLeave"
        >
          <span class="method-name"> {{ methodName }} </span>
        </button>
      </div>
      <p class="method-return-type">Return Type: {{ returnType }}</p>
      <div class="output-card tooltip-container">
        <span
          class="output-tooltip"
          @click="copyToClipboard(processedOutput, 'output')"
          :class="{ 'tooltip-copied': isOutputCopied }"
        >
          {{ outputTooltipText() }}
        </span>
        <button
          class="btn btn-output"
          @click="copyToClipboard(processedOutput, 'output')"
          @mouseleave="handleOutputMouseLeave"
        >
          <span class="output-text"> {{ processedOutput }} </span>
        </button>
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
    const isMethodNameCopied = ref(false);
    const isOutputCopied = ref(false);

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

    const methodNameTooltipText = () => {
      return isMethodNameCopied.value ? "Copied!" : "Copy method name";
    };

    const outputTooltipText = () => {
      return isOutputCopied.value ? "Copied!" : "Copy output";
    };

    const handleMethodNameMouseLeave = () => {
      // Reset the state when mouse leaves the button
      setTimeout(() => {
        isMethodNameCopied.value = false;
      }, 300);
    };

    const handleOutputMouseLeave = () => {
      // Reset the state when mouse leaves the button
      setTimeout(() => {
        isOutputCopied.value = false;
      }, 300);
    };

    // Clipboard functionality
    const copyToClipboard = async (
      text: string | undefined,
      type: "method" | "output"
    ) => {
      if (!text) return;
      console.log(text);

      const valueToUpdate =
        type === "method" ? isMethodNameCopied : isOutputCopied;

      valueToUpdate.value = true;
      const tooltipRef =
        type === "method" ? showMethodTooltip : showOutputTooltip;
      const formattedText = type === "method" ? `${text}()` : text;

      try {
        await navigator.clipboard.writeText(formattedText);
        tooltipRef.value = true;
        setTimeout(() => {
          tooltipRef.value = false;
          valueToUpdate.value = false;
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
      methodNameTooltipText,
      outputTooltipText,
      isMethodNameCopied,
      handleMethodNameMouseLeave,
      isOutputCopied,
      handleOutputMouseLeave,
      copyToClipboard,
      showMethodTooltip,
      showOutputTooltip,
      isOutputEmpty,
    };
  },
};
</script>
<style>
.function-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  height: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  }
}

.content {
  flex-grow: 2;
  display: flex;
  flex-direction: column;
}

.method-card {
  margin-top: 2rem;
}

.method-name {
  font-size: clamp(20px, 1.5vw, 36px);
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  margin: auto auto 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.method-return-type {
  color: #e0e0e0;
  font-size: 0.9rem;
  margin: auto;
  padding-top: 10px;
}

/* Button Styles */
.btn {
  background: none;
  border: none;
}

.btn-output,
.btn-method {
  height: 100%;
  width: 100%;
}

.copy-icon {
  color: white;
  transition: color 0.2s ease;
}

.output-card {
  position: relative;
  min-height: 50px;
  margin-top: 1rem;
  padding: 0 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 1rem;
  line-height: 1.6;
  word-break: break-word;
  overflow-x: auto;
  flex-grow: 1;
}

.output-text {
  color: white;
}

/* Tooltip Styles */
.tooltip-container {
  position: relative;
}

.output-tooltip,
.method-tooltip {
  visibility: hidden;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background-color: #158be6;
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
  margin-bottom: 5px;
}

.output-tooltip {
  bottom: 70%;
  animation: fadeInOut 0.1s;
}

.method-tooltip {
  bottom: 100%;
  opacity: 0;
  animation: fadeInOut 0.5s;
  transition: opacity 0.2s, visibility 0.2s;
}

.tooltip-container:hover .method-tooltip,
.tooltip-container:hover .output-tooltip {
  visibility: visible;
  opacity: 1;
}

.tooltip-copied {
  background-color: #28a745 !important;

  &::after {
    border-color: #28a745 transparent transparent transparent !important;
  }
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
