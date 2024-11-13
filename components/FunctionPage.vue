<template>
  <div id="app">
    <h1>JS Date Viewer</h1>
    <div class="inputs">
      <div>
        <label for="function-search">Function Name</label>
        <input
          id="function-search"
          type="text"
          placeholder="date, locale, etc."
          v-model="functionSearchRef"
        />
        <label for="datetime-input">Date</label>
        <input id="datetime-input" type="date" v-model="dateValue" />
        <label for="time-input">Time</label>
        <input id="time-input" type="time" step="0.001" v-model="timeValue" />
        <label for="timezone">Timezone</label>
        <select
          v-model="timeZoneRef"
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
        <label for="locale">Locale</label>
        <select v-model="localeRef" id="locale">
          <option
            v-for="{ value, label } in locales"
            :key="value?.toString()"
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
import { timezones, locales } from "~/server/helpers";
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
    const app = useNuxtApp();
    const $locale = app.$locale as Intl.LocalesArgument;

    const newDate = new Date();
    // In minutes, e.g., for GMT+1 it will be -60
    const timezoneOffset = newDate.getTimezoneOffset();

    // "subtract" the difference
    const correctiveOffset = -timezoneOffset;
    const gmtDate = new Date(newDate.getTime() + correctiveOffset * 60000);

    // Reactive references
    const functionSearchRef = ref("");
    const timeZoneRef = ref(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const localeRef = ref<Intl.LocalesArgument>($locale);
    const dateValue = ref(gmtDate.toISOString().slice(0, 10));
    const timeValue = ref(gmtDate.toISOString().slice(11, 23));
    const dateMethods = ref<DateMethodName[]>([]);

    // Format options ref to make it reactive
    const formatOptions = ref({
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: timeZoneRef.value,
    });

    // Computed property for combined date-time
    const inputValue = computed(() => {
      return `${dateValue.value}T${timeValue.value}`;
    });

    // Initialize timezone
    const initializeDefaultValues = () => {
      const foundTimezone = timezones.find(
        (tz) => tz.value === timeZoneRef.value
      );
      timeZoneRef.value = foundTimezone?.value || "UTC";
      formatOptions.value.timeZone = timeZoneRef.value;

      const foundLocale = locales.find(
        (locale) => locale.value === localeRef.value
      )?.value;

      localeRef.value = foundLocale || "en-DE";
    };

    const filterDateFunctions = () => {
      const date = new Date();
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
          prop.toLowerCase().includes(functionSearchRef.value.toLowerCase())
      );
    };

    // Handle timezone changes
    const handleTimezoneChange = () => {
      formatOptions.value = {
        ...formatOptions.value,
        timeZone: timeZoneRef.value,
      };
    };

    // Watch for timezone changes
    watch(timeZoneRef, () => {
      handleTimezoneChange();
    });

    // Initialize date methods
    onMounted(() => {
      initializeDefaultValues();
      dateMethods.value = filterDateFunctions();
    });

    // Watch for changes in processing Function to force refresh
    watch(
      () => functionSearchRef.value,
      () => {
        dateMethods.value = filterDateFunctions();
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
            localeRef.value,
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
      functionSearchRef,
      dateValue,
      timeValue,
      timeZoneRef,
      localeRef,
      dateMethods,
      createProcessingFunction,
      timezones,
      locales,
      inputValue,
      handleTimezoneChange,
    };
  },
};
</script>
<style scoped>
label {
  color: white;
}
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
