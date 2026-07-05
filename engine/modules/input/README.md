# Input Module

Responsibilities:
- Map keyboard, mouse, and gamepad input to named actions.
- Expose action state and simple event hooks.

Public API sketch:
- init(engineContext, options)
- bindAction(actionName, { keys, buttons })
- getActionState(actionName)
- on(actionName, callback)

