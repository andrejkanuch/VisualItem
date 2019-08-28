//// Type definitions for perfect-scrollbar v1.4.0
//// Project: https://github.com/utatti/perfect-scrollbar/blob/master/README.md

interface PerfectScrollbarSettings {
	/**
	 * It is a list of handlers to scroll the element.
	 * Default: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch']
	 */
	handlers?: ('click-rail' | 'drag-thumb' | 'keyboard' | 'wheel' | 'touch')[];

	/**
	 * When set to an integer value, the thumb part of the scrollbar will not expand over that number of pixels.
	 * Default: null
	 */
	maxScrollbarLength?: number;

	/**
	 * When set to an integer value, the thumb part of the scrollbar will not shrink below that number of pixels.
	 * Default: null
	 */
	minScrollbarLength?: number;

	/**
	 * This sets threashold for ps--scrolling- x and ps--scrolling- y classes to remain.In the default CSS, they make scrollbars shown regardless of hover state.The unit is millisecond.
	 * Default: 1000
	 */
	scrollingThreshold?: number;

	/**
	 * The number of pixels the content width can surpass the container width without enabling the X axis scroll bar.Allows some "wiggle room" or "offset break", so that X axis scroll bar is not enabled just because of a few pixels.
	 * Default: 0
	 */
	scrollXMarginOffset?: number;

	/**
	 * The number of pixels the content height can surpass the container height without enabling the Y axis scroll bar.Allows some "wiggle room" or "offset break", so that Y axis scroll bar is not enabled just because of a few pixels.
	 * Default: 0
	 */
	scrollYMarginOffset?: number;

	/**
	 * When set to true, the scroll bar in X axis will not be available, regardless of the content width.
	 * Default: false
	 */
	suppressScrollX?: boolean;

	/**
	 * When set to true, the scroll bar in Y axis will not be available, regardless of the content height.
	 * Default: false
	 */
	suppressScrollY?: boolean;

	/**
	 * If this option is true, swipe scrolling will be eased.
	 * Default: true
	 */
	swipeEasing?: boolean;

	/**
	 * When set to true, and only one (vertical or horizontal) scrollbar is visible then both vertical and horizontal scrolling will affect the scrollbar.
	 * Default: false
	 */
	useBothWheelAxes?: boolean;

	/**
	 * If this option is true, when the scroll reaches the end of the side, mousewheel event will be propagated to parent element.
	 * Default: false
	 */
	wheelPropagation?: boolean;

	/**
	 * The scroll speed applied to mousewheel event.
	 * Default: 1
	 */
	wheelSpeed?: number;
}

declare class PerfectScrollbar {
	/**
	 * Instantiate the scrollbar.
	 * @param element Can be HTMLElement object or selector string for document.querySelector(), when the first element that match the selector will be used.
	 * @param userSettings PerfectScrollbarSettings object.
	 */
	constructor(element: HTMLElement | string, userSettings?: PerfectScrollbarSettings);

	/**
	 * Update the scrollbar, when the size of container or content has changed.
	 */
	update(): void;

	/**
	 * Destroy the scrollbar.
	 */
	destroy(): void;
}
