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
        <div class="container">
          <transition name="fade">
            <router-view class="viewer"></router-view>
          </transition>
        </div>
      </div>
    )
  }
};