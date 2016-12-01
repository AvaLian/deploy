import './index.css';
import AppHeader from '../AppHeader';

export default {
  name: 'app',
  components: {
    AppHeader,
  },
  render(h) {
    return (
      <div id="app">
        <app-header></app-header>
        <router-view class="container"></router-view>
      </div>
    )
  }
};