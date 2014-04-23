require 'mongoid'

class Level
  include Mongoid::Document

  belongs_to :quest

  has_many :tasks
  field :tasks, :type => Array, :default => []

  has_many :completedobjects
  field :completedobjects, :type => Array, :default => []

  field :order, :type => Integer
  field :label, :type => String
  field :locked, :type => Boolean, :default => true
  field :introduction, :type => String
  field :idstounlock, :type => Array, :default => []
end