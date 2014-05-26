require 'mongoid'

class Task
  include Mongoid::Document

  belongs_to :level

  has_many :completedobjects
  field :completedobjects, :type => Array, :default => []

  field :order, :type => Integer
  field :label, :type => String
  field :introduction, :type => String
  field :badges, :type => Array, :default => []
  field :idstounlock, :type => Array, :default => []
  field :isblogurltask, :type => Boolean, :default => false
  field :author, :type => String
end