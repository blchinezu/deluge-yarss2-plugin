# -*- coding: utf-8 -*-
#
# Copyright (C) 2012-2015 bendikro bro.devel+yarss2@gmail.com
#
# This file is part of YaRSS2 and is licensed under GNU General Public License 3.0, or later, with
# the additional special exception to link portions of this program with the OpenSSL library.
# See LICENSE for more details.
#

from deluge.core.rpcserver import export
from deluge.plugins.pluginbase import CorePluginBase

import yarss2.util.common
import yarss2.util.logger
from yarss2.rssfeed_scheduler import RSSFeedScheduler
from yarss2.torrent_handling import TorrentHandler
from yarss2.util.http import get_matching_cookies_dict
from yarss2.util.yarss_email import send_torrent_email
from yarss2.yarss_config import YARSSConfig, get_user_agent

import json

class Core(CorePluginBase):

    def __init__(self, name):
        """Used for tests only"""
        if name is not "test":
            super(Core, self).__init__(name)
        else:
            # To avoid warnings when running tests
            self._component_name = name

    def enable(self, config=None):
        self.log = yarss2.util.logger.Logger()
        self.torrent_handler = TorrentHandler(self.log)
        if config is None:
            self.yarss_config = YARSSConfig(self.log)
        else:
            self.yarss_config = config
        self.rssfeed_scheduler = RSSFeedScheduler(self.yarss_config, self.log)
        self.rssfeed_scheduler.enable_timers()
        self.log.info("Enabled YaRSS2 %s" % yarss2.util.common.get_version())

    def disable(self):
        self.yarss_config.save()
        self.rssfeed_scheduler.disable_timers()

    def update(self):
        pass

    @export
    def initiate_rssfeed_update(self, rssfeed_key, subscription_key=None):
        return self.rssfeed_scheduler.queue_rssfeed_update(rssfeed_key, subscription_key=subscription_key)

    @export
    def get_config(self):
        "Returns the config dictionary"
        return self.yarss_config.get_config()

    @export
    def save_general_config(self, conf):
        conf = {"general": conf}
        try:
            self.yarss_config.set_config(conf)
        except ValueError as (v):
            self.log.error("Failed to save general configurations:" + str(v))

    @export
    def save_email_configurations(self, email_configurations):
        conf = {"email_configurations": email_configurations}
        try:
            self.yarss_config.set_config(conf)
        except ValueError as (v):
            self.log.error("Failed to save email configurations:" + str(v))

    @export
    def save_subscription(self, dict_key=None, subscription_data=None, delete=False):
        """Saves the subscription in subscription_data.
        If subscription_data is None and delete=True, delete subscription with key==dict_key
        """

        with open('/home/brucelee/Desktop/asdf.js', 'w') as f:
            f.write("\n==================================\n\n>>> INITIAL CONFIG:\n")
            f.write(json.dumps(self.yarss_config.config.config['subscriptions']['5'], sort_keys=True, indent=4, separators=(',', ': ')))

            f.write("\n==================================\n\n>>> subscription_data:\n")
            f.write(json.dumps(subscription_data, sort_keys=True, indent=4, separators=(',', ': ')))

            if delete:
                if subscription_data is not None:
                    self.log.warn("save_subscription called with delete=True, but rssfeed_data is not None!")
                else:
                    self.log.info("Deleting Subscription '%s'" %
                                  self.yarss_config.get_config()["subscriptions"][dict_key]["name"])
            try:
                asdf = self.yarss_config.generic_save_config("subscriptions", dict_key=dict_key,
                                                             data_dict=subscription_data, delete=delete)

                f.write("\n==================================\n\n>>> NEW CONFIG:\n")
                f.write(json.dumps(self.yarss_config.config.config['subscriptions']['5'], sort_keys=True, indent=4, separators=(',', ': ')))

                return asdf
            except ValueError as (v):
                self.log.error("Failed to save subscription:" + str(v))


        return None

    @export
    def save_rssfeed(self, dict_key=None, rssfeed_data=None, delete=False):
        """Saves the rssfeed in rssfeed_data.
        If rssfeed_data is None and delete=True, delete rssfeed with key==dict_key
        """
        try:
            if delete:
                if rssfeed_data is not None:
                    self.log.warn("save_rssfeed called with delete=True, but rssfeed_data is not None!")
                else:
                    self.log.info("Stopping and deleting RSS Feed '%s'" %
                                  self.yarss_config.get_config()["rssfeeds"][dict_key]["name"])

            config = self.yarss_config.generic_save_config("rssfeeds", dict_key=dict_key,
                                                           data_dict=rssfeed_data, delete=delete)
            if delete is True:
                self.rssfeed_scheduler.delete_timer(dict_key)
            # Successfully saved rssfeed, check if timer was changed
            elif config:
                if self.rssfeed_scheduler.set_timer(rssfeed_data["key"], rssfeed_data["update_interval"],
                                                    rssfeed_data["update_on_startup"]):
                    self.log.info("Scheduled RSS Feed '%s' with interval %s" %
                                  (rssfeed_data["name"], rssfeed_data["update_interval"]))
            return config
        except ValueError as (v):
            self.log.error("Failed to save rssfeed:" + str(v))

    @export
    def save_cookie(self, dict_key=None, cookie_data=None, delete=False):
        """Save cookie to config.
        If cookie_data is None and delete=True, delete cookie with key==dict_key"""
        if cookie_data:
            if type(cookie_data["value"]) is not dict:
                self.log.error("Cookie value must be a dictionary!")
                return None
        try:
            return self.yarss_config.generic_save_config("cookies", dict_key=dict_key,
                                                         data_dict=cookie_data, delete=delete)
        except ValueError as (v):
            self.log.error("Failed to save cookie:" + str(v))

    @export
    def save_email_message(self, dict_key=None, message_data=None, delete=False):
        """Save email message to config.
        If message_data is None, delete message with key==dict_key"""
        try:
            return self.yarss_config.generic_save_config("email_messages", dict_key=dict_key,
                                                         data_dict=message_data, delete=delete)
        except ValueError as (v):
            self.log.error("Failed to save email message:" + str(v))

    @export
    def send_test_email(self, email_key):
        """
        Send a test email
        """
        self.email_config = self.yarss_config.get_config().get('email_configurations', {})
        self.email_messages = self.yarss_config.get_config().get('email_messages', {})
        torrents = ["Torrent title"]
        return send_torrent_email(self.email_config,
                                  self.email_messages[email_key],
                                  subscription_data={"name": "Test subscription"},
                                  torrent_name_list=torrents,
                                  deferred=True)

    @export
    def add_torrent(self, torrent_info):
        site_cookies_dict = get_matching_cookies_dict(self.yarss_config.get_config()["cookies"], torrent_info["link"])
        torrent_info["site_cookies_dict"] = site_cookies_dict
        if "rssfeed_key" in torrent_info:
            rssfeed_data = self.yarss_config.get_config()["rssfeeds"][torrent_info["rssfeed_key"]]
            torrent_info["user_agent"] = get_user_agent(rssfeed_data=rssfeed_data)
        torrent_download = self.torrent_handler.add_torrent(torrent_info)
        return torrent_download.to_dict()

    @export
    def get_completion_paths(self, value):
        """
        Returns the available path completions for the input value.
        """
        return yarss2.util.common.get_completion_paths(value)
