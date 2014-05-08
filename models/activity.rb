require 'mongoid'

class Activity
  include Mongoid::Document

  field :type, :type => String
  field :label, :type => String
  field :url, :type => String
  field :studentId, :type => String
  field :groupId, :type => String
  field :time, :type => Integer
  field :ownerName, :type => String
  field :ownerAvatar, :type => String
  field :badgeId, :type => String
end