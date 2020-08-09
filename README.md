# Design Explorer

A canvas implementation of Zoomable, pannable viewport for viewing your large design spread in browser, figma style!

## Usage

---

Step.1 Include the necessary JavaScript and CSS into the HTML Files. The javascript file should be include at the end of html document, NOT in the header.

Step.2 Example usage

```
<div class="design-explorer" data-cols="3" data-init-zoom="30" data-zoom-hint="onScroll">
  <img src="img/png/7-sign-up.png" alt="sign up">
  <img src="img/png/8-setting-a-goal.png" alt="setting a goal">
  <img src="img/png/9-creating-a-task.png" alt="creating a task">
  <img src="img/png/10-finding-a-task.png" alt="finding a task">
  <img src="img/png/11-viewing-your-task.png" alt="viewing your task">
  <img src="img/png/12-contact.png" alt="contact">
  <img src="img/png/13-accept.png" alt="accept">
  <img src="img/png/14-cancel.png" alt="cancel">
  <img src="img/png/15-check-in-before.png" alt="check in - before">
  <img src="img/png/16-check-in-during-after.png" alt="check in- during, after">
  <img src="img/png/17-payment.png" alt="payment">
  <img src="img/png/18-leave-reviews.png" alt="leave reviews">
  <img src="img/png/19-notification.png" alt="notification">
</div>
```

## Configurations

---

### data-zoom-hint

Control when to show the interaction hint.

- `onScroll` > only show when the user scroll the webpage
- ``onMouseOver` > only show when the user scroll and mouse over the viewport
- `none` > no hints

Default value: `none`

### data-init-zoom

Define the initial zoom value.
Default value: `100`

### data-cols

Define how much columns the layout engine should aim for when displaying the images.
Default value: `1`

### data-scroll-to-pan

Determine if the viewport allow panning using the trackpad or scrolling on mouse.
Default value: `false`

### data-zoom-hint-duration

Determine how long should the zoom hint shows
Default value: `1000` (1 second)

## TODO

---

- Touch Screen support
- layout bug fix > image overlap in if it is too big
