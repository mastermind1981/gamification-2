require 'mongoid'

class Level
  include Mongoid::Document

  belongs_to :quest

  has_many :tasks
  field :tasks, :type => Array, :default => []

  field :label, :type => String
  field :introduction, :type => String
  field :completedGroups, :type => Array, :default => []
end