package main

import (
	"context"
	"sync"

	notify "github.com/dhaavi/go-notify"
	"github.com/safing/portbase/log"
)

var (
	capabilites notify.Capabilities

	notifsByID     = make(map[uint32]*Notification)
	notifsByIDLock sync.Mutex
)

func init() {
	var err error
	capabilites, err = notify.GetCapabilities()
	if err != nil {
		log.Errorf("failed to get notification system capabilities: %s", err)
	}
}

func handleActions(ctx context.Context, actions chan notify.Signal) {
	mainWg.Add(1)
	defer mainWg.Done()

	for {
		select {
		case <-ctx.Done():
			return
		case sig := <-actions:
			log.Tracef("notify: recevied signal: %+v", sig)
			if sig.ActionKey != "" {
				// get notification by system ID
				notifsByIDLock.Lock()
				n, ok := notifsByID[sig.ID]
				notifsByIDLock.Unlock()

				// send action
				if ok {
					n.SelectAction(sig.ActionKey)
				}
			}
		}
	}

}

func actionListener() {
	actions := make(chan notify.Signal, 100)

	go handleActions(mainCtx, actions)

	err := notify.SignalNotify(mainCtx, actions)
	if err != nil && err != context.Canceled {
		log.Errorf("notify: signal listener failed: %s", err)
	}
}

// Show shows the notification.
func (n *Notification) Show() {
	sysN := notify.NewNotification("Portmaster", n.Message)
	// see https://developer.gnome.org/notification-spec/

	// The optional name of the application sending the notification.
	// Can be blank.
	sysN.AppName = "Portmaster"

	// The optional notification ID that this notification replaces.
	sysN.ReplacesID = n.systemID

	// The optional program icon of the calling application.
	// sysN.AppIcon string

	// The summary text briefly describing the notification.
	// Summary string (arg 1)

	// The optional detailed body text.
	// Body string (arg 2)

	// The actions send a request message back to the notification client
	// when invoked.
	// sysN.Actions []string
	if capabilites.Actions {
		sysN.Actions = make([]string, 0, len(n.AvailableActions)*2)
		for _, action := range n.AvailableActions {
			if action.IsSupported() {
				sysN.Actions = append(sysN.Actions, action.ID)
				sysN.Actions = append(sysN.Actions, action.Text)
			}
		}
	}

	// Set Portmaster icon.
	iconLocation, err := ensureAppIcon()
	if err != nil {
		log.Warningf("notify: failed to write icon: %s", err)
	}
	sysN.AppIcon = iconLocation

	// TODO: Use hints to display icon of affected app.
	// Hints are a way to provide extra data to a notification server.
	// sysN.Hints = make(map[string]interface{})

	// The timeout time in milliseconds since the display of the
	// notification at which the notification should automatically close.
	// sysN.Timeout int32

	newID, err := sysN.Show()
	if err != nil {
		log.Warningf("notify: failed to show notification %s", n.EventID)
		return
	}

	notifsByIDLock.Lock()
	notifsByID[newID] = n
	notifsByIDLock.Unlock()

	n.Lock()
	defer n.Unlock()
	n.systemID = newID
}

// Cancel cancels the notification.
func (n *Notification) Cancel() {
	n.Lock()
	defer n.Unlock()

	// TODO: could a ID of 0 be valid?
	if n.systemID != 0 {
		err := notify.CloseNotification(n.systemID)
		if err != nil {
			log.Warningf("notify: failed to close notification %s/%d", n.EventID, n.systemID)
		}

		notifsByIDLock.Lock()
		delete(notifsByID, n.systemID)
		notifsByIDLock.Unlock()
	}
}
