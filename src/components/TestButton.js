import { defineComponent, signal } from 'rxhtmx';

export default defineComponent({
  name: 'TestButton',
  setup() {
    const state = signal(null);

    return {
      state,
    };
  },
  template: `
    <div class="testbutton">
      <h1>TestButton Component</h1>
      <p>{{ state }}</p>
    </div>
  `,
});
