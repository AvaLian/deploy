<template>
  <div class="home">
    <div class="home_banner">
      <div class="home_slogon">
        <p class="home_slogon_tip">上线，</p>
        <p class="home_slogon_tip">就从这里开始。</p>
      </div>
    </div>
  </div>
</template>

<style>
  .home_banner {
    width: 100%;
    height: 320px;
    background: url(../assests/images/home_banner.jpg) no-repeat center center;
    background-size: cover;
    animation: slide-bg-show .5s ease;
  }
  .home_slogon {
    padding: 56px 60px;
    line-height: 62px;
  }
  .home_slogon_tip {
    font-size: 40px;
    color: #fff;
    text-shadow: 0 0 10px rgba(0,0,0,0.4);
  }
  @keyframes slide-bg-show {
    0% {
      transform: translate(-10px,-18px);
      opacity: .2
    }

    100% {
      transform: translate(0,0);
      opacity: 1
    }
  }
</style>