<template>
  <div id="app">
    <h1>JS Date Viewer</h1>
    <div class="inputs">
      <div>
        <label for="function-search">Function Search:</label>
        <input id="function-search" type="text" v-model="functionSearch" />
        <label for="datetime-input">DateTime Input:</label>
        <input id="datetime-input" type="date" v-model="dateValue" />
        <label for="time-input">Time Input:</label>
        <input id="time-input" type="time" step="0.001" v-model="timeValue" />
        <label for="timezone">Select Timezone:</label>
        <select
          v-model="timeZoneValue"
          id="timezone"
          @change="handleTimezoneChange"
        >
          <option
            v-for="{ label, value } in timezones"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </select>
      </div>
    </div>
    <div class="function-cards-container">
      <FunctionCard
        v-for="method in dateMethods"
        :key="method"
        :inputValue="inputValue"
        :methodName="method"
        :processingFunction="createProcessingFunction(method)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { timezones } from "~/server/helpers";
import { useNuxtApp } from "#app";
import FunctionCard from "~/components/FunctionCard.vue";

type DateMethodName = Extract<keyof Date, string>;

function isDateMethod(key: string): key is DateMethodName {
  return key in Date.prototype && typeof key === "string";
}

export default {
  name: "App",
  components: {
    FunctionCard,
  },
  setup() {
    const { $locale } = useNuxtApp();
    const newDate = new Date();

    // Reactive references
    const timeZoneValue = ref("");
    const functionSearch = ref("");
    const dateValue = ref(newDate.toISOString().slice(0, 10));
    const timeValue = ref(newDate.toISOString().slice(11, 23));
    const dateMethods = ref<DateMethodName[]>([]);

    // Format options ref to make it reactive
    const formatOptions = ref({
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    // Computed property for combined date-time
    const inputValue = computed(() => {
      return `${dateValue.value}T${timeValue.value}`;
    });

    // Initialize timezone
    const initializeTimezone = () => {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const foundTimezone = timezones.find(
        (tz) => tz.value === browserTimezone
      );
      timeZoneValue.value = foundTimezone?.value || "UTC";
      formatOptions.value.timeZone = timeZoneValue.value;
    };

    const filterDateFunctions = (date: Date) => {
      const proto = Object.getPrototypeOf(date);
      const allProps = Object.getOwnPropertyNames(proto);
      return allProps.filter(
        (prop): prop is DateMethodName =>
          isDateMethod(prop) &&
          (typeof date[prop as keyof Date] === "function" ||
            typeof Object.getOwnPropertyDescriptor(proto, prop)?.get ===
              "function") &&
          !prop.startsWith("set") &&
          !prop.startsWith("constructor") &&
          prop.toLowerCase().includes(functionSearch.value.toLowerCase())
      );
    };

    // Handle timezone changes
    const handleTimezoneChange = () => {
      formatOptions.value = {
        ...formatOptions.value,
        timeZone: timeZoneValue.value,
      };
    };

    // Watch for timezone changes
    watch(timeZoneValue, (newValue) => {
      handleTimezoneChange();
    });

    // Initialize date methods
    onMounted(() => {
      initializeTimezone();
      dateMethods.value = filterDateFunctions(newDate);
    });

    // Watch for changes in processing Function to force refresh
    watch(
      () => functionSearch.value,
      () => {
        dateMethods.value = filterDateFunctions(newDate);
        // The computed property will automatically re-evaluate
      },
      { immediate: false }
    );

    const createProcessingFunction = (method: DateMethodName) => {
      return (input: string) => {
        if (!input) return "";
        const date = new Date(input);
        // Handle methods that support localization
        if (method.includes("Locale")) {
          return (date[method] as Function).call(
            date,
            $locale,
            formatOptions.value
          );
        }

        const value = date[method];
        if (typeof value === "function") {
          return (value as Function).call(date);
        }
        return String(value);
      };
    };

    return {
      functionSearch,
      dateValue,
      timeValue,
      timeZoneValue,
      dateMethods,
      createProcessingFunction,
      timezones,
      inputValue,
      handleTimezoneChange,
    };
  },
};
</script>
<style scoped>
.inputs {
  display: flex;
  max-width: 500px;
  margin: auto;
  gap: 2rem;
  align-items: center;
  justify-content: space-between;
}

.inputs > div {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: #0056b3;
}

input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #007bff;
}

/* Responsive grid layout styles */
.function-cards-container {
  display: grid;
  gap: 3.5rem;
  padding: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1400px) {
  .function-cards-container {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 1100px) {
  .function-cards-container {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .function-cards-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .function-cards-container {
    grid-template-columns: 1fr;
  }
}
</style>
